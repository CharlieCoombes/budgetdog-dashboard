import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { SubscriptionData, MetricsData, ProductMetrics, BUDGETDOG_PRODUCTS, EXCLUDED_EMAILS } from '@/types/dashboard';

interface TrialConversionData {
  productId: string;
  conversions: number;
  total_trials: number;
  conversion_rate: number;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Cache for storing data to improve performance
let cachedData: {
  data: SubscriptionData[];
  timestamp: number;
} | null = null;


const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Helper function to fetch all events with proper pagination
async function fetchAllStripeEvents(
  eventType: string,
  startTime: number,
  endTime: number
): Promise<Stripe.Event[]> {
  const allEvents: Stripe.Event[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;
  let totalFetched = 0;
  
  console.log(`🔄 Fetching all ${eventType} events from ${new Date(startTime * 1000).toISOString()} to ${new Date(endTime * 1000).toISOString()}`);
  
  while (hasMore) {
    const listParams: any = {
      type: eventType,
      created: { gte: startTime, lte: endTime },
      limit: 100
    };
    
    if (startingAfter) {
      listParams.starting_after = startingAfter;
    }
    
    const eventList = await stripe.events.list(listParams);
    allEvents.push(...eventList.data);
    totalFetched += eventList.data.length;
    
    hasMore = eventList.has_more;
    if (hasMore && eventList.data.length > 0) {
      startingAfter = eventList.data[eventList.data.length - 1].id;
    }
    
    // Log progress every 500 events
    if (totalFetched % 500 === 0) {
      console.log(`📊 Fetched ${totalFetched} ${eventType} events...`);
    }
  }
  
  console.log(`✅ Fetched ${totalFetched} total ${eventType} events`);
  return allEvents;
}

async function fetchTrialConversionData(): Promise<TrialConversionData[]> {
  console.log('🔄 Calculating actual trial-to-paid conversion rates from Stripe events...');
  
  try {
    // Get trial-to-active conversion events from the last 12 months
    const oneYearAgo = Math.floor((Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000);
    const now = Math.floor(Date.now() / 1000);
    
    const conversionData = new Map<string, { conversions: number; trials: number }>();
    
    // Initialize for all products
    Object.keys(BUDGETDOG_PRODUCTS).forEach(productId => {
      conversionData.set(productId, { conversions: 0, trials: 0 });
    });
    
    console.log('📊 Analyzing trial conversion events from Stripe...');
    
    // Fetch ALL trial-to-paid conversions from subscription.updated events
    const updateEvents = await fetchAllStripeEvents('customer.subscription.updated', oneYearAgo, now);
    
    for (const event of updateEvents) {
      const subscription = event.data.object as Stripe.Subscription;
      const previousAttributes = event.data.previous_attributes as any;
      
      // Find Budgetdog products in this subscription
      const budgetdogItem = subscription.items.data.find(item => 
        item.price?.product && Object.keys(BUDGETDOG_PRODUCTS).includes(item.price.product as string)
      );
      
      if (budgetdogItem && budgetdogItem.price?.product) {
        const productId = budgetdogItem.price.product as string;
        const data = conversionData.get(productId)!;
        
        // Track trial-to-active conversions only
        if (previousAttributes?.status === 'trialing' && subscription.status === 'active') {
          data.conversions++;
          console.log(`✅ Trial conversion: ${BUDGETDOG_PRODUCTS[productId as keyof typeof BUDGETDOG_PRODUCTS]} (${subscription.id})`);
        }
      }
    }
    
    // Fetch ALL trial starts from subscription.created events
    const createEvents = await fetchAllStripeEvents('customer.subscription.created', oneYearAgo, now);
    
    for (const event of createEvents) {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Find Budgetdog products in this subscription
      const budgetdogItem = subscription.items.data.find(item => 
        item.price?.product && Object.keys(BUDGETDOG_PRODUCTS).includes(item.price.product as string)
      );
      
      if (budgetdogItem && budgetdogItem.price?.product) {
        const productId = budgetdogItem.price.product as string;
        const data = conversionData.get(productId)!;
        
        // Only count actual trials - not direct active subscriptions
        if (subscription.status === 'trialing') {
          data.trials++;
          console.log(`📝 Trial started: ${BUDGETDOG_PRODUCTS[productId as keyof typeof BUDGETDOG_PRODUCTS]} (${subscription.id})`);
        }
      }
    }
    
    console.log(`📈 Processed ${updateEvents.length} update events and ${createEvents.length} create events from the last 12 months`);
    
    // Create results
    const results: TrialConversionData[] = Object.keys(BUDGETDOG_PRODUCTS).map(productId => {
      const data = conversionData.get(productId)!;
      const conversionRate = data.trials > 0 ? (data.conversions / data.trials) * 100 : 0;
      
      return {
        productId,
        conversions: data.conversions,
        total_trials: data.trials,
        conversion_rate: conversionRate
      };
    });
    
    console.log(`✅ Calculated ACTUAL conversion rates:`);
    results.forEach(result => {
      const productName = BUDGETDOG_PRODUCTS[result.productId as keyof typeof BUDGETDOG_PRODUCTS];
      console.log(`${productName}: ${result.conversions}/${result.total_trials} (${result.conversion_rate.toFixed(1)}%)`);
    });
    
    return results;
    
  } catch (error) {
    console.error('❌ Error calculating actual conversion rates:', error);
    
    // Fallback: show 0% if we can't calculate real rates
    return Object.keys(BUDGETDOG_PRODUCTS).map(productId => ({
      productId,
      conversions: 0,
      total_trials: 0,
      conversion_rate: 0
    }));
  }
}

async function fetchStripeData(): Promise<SubscriptionData[]> {
  // Check cache first
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }

  console.log('🔄 Fetching fresh data from Stripe...');
  
  const allSubscriptions: SubscriptionData[] = [];
  const customerCache = new Map<string, string>();

  try {
    // Fetch all subscriptions in one call instead of by status for better performance
    const subscriptions: SubscriptionData[] = [];
    
    for await (const subscription of stripe.subscriptions.list({
      limit: 100,
      expand: ['data.items.data.price']
    })) {
        try {
          // Check if subscription has Budgetdog products
          const budgetdogItem = subscription.items.data.find(
            item => item.price?.product && Object.keys(BUDGETDOG_PRODUCTS).includes(item.price.product as string)
          );

          if (!budgetdogItem) continue;

          // Get product details if needed
          let productId = budgetdogItem.price?.product as string;
          if (!productId) continue;

          // Get customer email (use cache to avoid duplicate API calls)
          let customerEmail = '';
          if (!customerCache.has(subscription.customer as string)) {
            try {
              const customer = await stripe.customers.retrieve(subscription.customer as string);
              const email = (customer as Stripe.Customer).email?.toLowerCase() || '';
              customerCache.set(subscription.customer as string, email);
              customerEmail = email;
            } catch {
              customerEmail = '';
            }
          } else {
            customerEmail = customerCache.get(subscription.customer as string) || '';
          }

        // Skip excluded emails
        if (EXCLUDED_EMAILS.includes(customerEmail)) continue;

        subscriptions.push({
          subscription_id: subscription.id,
          customer_id: subscription.customer as string,
          customer_email: customerEmail,
          product_id: productId,
          status: subscription.status as 'active' | 'trialing' | 'canceled',
          amount: (budgetdogItem.price?.unit_amount || 0) / 100,
          created_at: new Date(subscription.created * 1000).toISOString(),
        });
      } catch (error) {
        console.error('Error processing subscription:', error);
        continue;
      }
    }

    allSubscriptions.push(...subscriptions);

    // Update cache
    cachedData = {
      data: allSubscriptions,
      timestamp: Date.now()
    };

    console.log(`✅ Fetched ${allSubscriptions.length} Budgetdog subscriptions`);
    return allSubscriptions;
    
  } catch (error) {
    console.error('Error fetching Stripe data:', error);
    throw new Error('Failed to fetch subscription data');
  }
}

async function getSubscriptionConversions(startDate: string, endDate: string): Promise<number> {
  try {
    const start = Math.floor(new Date(startDate).getTime() / 1000);
    const end = Math.floor(new Date(endDate).getTime() / 1000);
    
    console.log(`🔍 Looking for conversions between ${new Date(start * 1000).toISOString()} and ${new Date(end * 1000).toISOString()}`);
    
    let conversions = 0;
    
    // Fetch ALL subscription.updated events for the period with proper pagination
    const updateEvents = await fetchAllStripeEvents('customer.subscription.updated', start, end);
    
    for (const event of updateEvents) {
      const subscription = event.data.object as Stripe.Subscription;
      const previousAttributes = event.data.previous_attributes as any;
      
      // Check if this was a trial-to-active conversion
      if (
        previousAttributes?.status === 'trialing' &&
        subscription.status === 'active' &&
        subscription.items.data.some(item => 
          item.price?.product && 
          Object.keys(BUDGETDOG_PRODUCTS).includes(item.price.product as string)
        )
      ) {
        conversions++;
        console.log(`✅ Found trial-to-active conversion: ${subscription.id}`);
      }
    }
    
    console.log(`📊 Processed ${updateEvents.length} update events. Total conversions: ${conversions}`);
    return conversions;
  } catch (error) {
    console.error('❌ Error fetching conversion events:', error);
    return 0;
  }
}

async function calculateTrialsInPeriod(startDate: string, endDate: string): Promise<number> {
  try {
    const start = Math.floor(new Date(startDate).getTime() / 1000);
    const end = Math.floor(new Date(endDate).getTime() / 1000);
    
    console.log(`🔍 Looking for trial starts between ${new Date(start * 1000).toISOString()} and ${new Date(end * 1000).toISOString()}`);
    
    let trials = 0;
    
    // Fetch ALL subscription.created events for the period with proper pagination
    const createEvents = await fetchAllStripeEvents('customer.subscription.created', start, end);
    
    for (const event of createEvents) {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Check if this was a trial start
      if (
        subscription.status === 'trialing' &&
        subscription.items.data.some(item => 
          item.price?.product && 
          Object.keys(BUDGETDOG_PRODUCTS).includes(item.price.product as string)
        )
      ) {
        trials++;
        console.log(`📝 Found trial start: ${subscription.id}`);
      }
    }
    
    console.log(`📊 Processed ${createEvents.length} create events. Total trial starts: ${trials}`);
    return trials;
  } catch (error) {
    console.error('❌ Error fetching trial start events:', error);
    return 0;
  }
}

function calculateMetrics(data: SubscriptionData[], trialData: TrialConversionData[], startDate?: string, endDate?: string, conversionsInPeriod?: number, trialsInPeriod?: number): MetricsData {
  let filteredData = data;
  
  // Apply date filtering for new trials (created in period)
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    filteredData = data.filter(sub => {
      const createdAt = new Date(sub.created_at);
      return createdAt >= start && createdAt <= end;
    });
  }

  // For MRR calculation, we want ALL active subscriptions regardless of date filter
  const allActive = data.filter(sub => sub.status === 'active');
  const totalMrr = allActive.reduce((sum, sub) => sum + sub.amount, 0);

  // New trials = trials created in the date range (from Events API if available, otherwise from filtered data)
  const newTrials = trialsInPeriod !== undefined ? trialsInPeriod : filteredData.filter(sub => sub.status === 'trialing').length;
  
  // New subscriptions = conversions that happened in the date range (from Events API)
  const newSubscriptions = conversionsInPeriod || filteredData.filter(sub => sub.status === 'active').length;
  
  const newCancelled = filteredData.filter(sub => sub.status === 'canceled');

  // Calculate conversion rate for the filtered period
  let trialConversionRate = 0;

  // Calculate historical conversion rate first as fallback
  const historicalConversionRate = trialData.reduce((sum, trial) => sum + trial.total_trials, 0) > 0 
    ? (trialData.reduce((sum, trial) => sum + trial.conversions, 0) / trialData.reduce((sum, trial) => sum + trial.total_trials, 0)) * 100 
    : 0;

  if (startDate && endDate && conversionsInPeriod !== undefined && trialsInPeriod !== undefined) {
    // For date-filtered periods with Events API data - use consistent time period
    const subscriptionsInPeriod = conversionsInPeriod;
    const trialsInThisPeriod = trialsInPeriod;
    
    console.log(`💡 Period calculation: ${subscriptionsInPeriod} conversions, ${trialsInThisPeriod} new trials`);
    
    if (trialsInThisPeriod > 0) {
      // Calculate rate based on period data with consistent time windows
      trialConversionRate = (subscriptionsInPeriod / trialsInThisPeriod) * 100;
      console.log(`📈 Period conversion rate: ${trialConversionRate.toFixed(1)}%`);
    } else {
      // Fall back to historical rate
      trialConversionRate = historicalConversionRate;
      console.log(`📈 Using historical conversion rate: ${trialConversionRate.toFixed(1)}%`);
    }
  } else {
    // All-time conversion rate
    trialConversionRate = historicalConversionRate;
    console.log(`📈 All-time conversion rate: ${trialConversionRate.toFixed(1)}%`);
  }

  // Calculate LTV
  const customerRevenue = new Map<string, number>();
  filteredData.forEach(sub => {
    const current = customerRevenue.get(sub.customer_id) || 0;
    customerRevenue.set(sub.customer_id, current + sub.amount);
  });
  
  const avgLtv = customerRevenue.size > 0 
    ? Array.from(customerRevenue.values()).reduce((sum, val) => sum + val, 0) / customerRevenue.size 
    : 0;

  // Fixed LTV values based on actual pricing
  const FIXED_LTV = {
    'prod_S9H5fDgFs9Lv7y': 215.88, // Millionaire Club: $17.99 * 12
    'prod_S8Y6cYg18JDFLG': 299.88, // Network: $24.99 * 12  
    'prod_RslgGi1t7MBOE6': 215.88  // Academy: $17.99 * 12
  };

  // Calculate weighted average predictive LTV using fixed values
  let totalWeightedLtv = 0;
  let totalActiveCustomers = 0;
  
  Object.keys(BUDGETDOG_PRODUCTS).forEach(productId => {
    const productData = filteredData.filter(sub => sub.product_id === productId);
    const productActive = productData.filter(sub => sub.status === 'active');
    
    if (productActive.length > 0) {
      const fixedLtv = FIXED_LTV[productId as keyof typeof FIXED_LTV];
      totalWeightedLtv += fixedLtv * productActive.length;
      totalActiveCustomers += productActive.length;
    }
  });
  
  const predictiveLtv = totalActiveCustomers > 0 ? totalWeightedLtv / totalActiveCustomers : 0;

  // Monthly take rate data (calculated from BDA member email lists)
  const monthlyTakeRates = [
    { month: 'May 2025', rate: 36.7, signups: 18, newMembers: 49 },
    { month: 'June 2025', rate: 41.4, signups: 29, newMembers: 70 },
    { month: 'July 2025', rate: 36.2, signups: 34, newMembers: 94 }
  ];
  const currentTakeRate = monthlyTakeRates[monthlyTakeRates.length - 1]; // Most recent month

  return {
    active: startDate && endDate ? newSubscriptions : allActive.length,
    trialing: newTrials,
    cancelled: newCancelled.length,
    total_mrr: totalMrr,
    conversion_rate: trialConversionRate,
    total_records: startDate && endDate ? filteredData.length : data.length,
    avg_ltv: avgLtv,
    predictive_ltv: predictiveLtv,
    take_rate_data: {
      take_rate: currentTakeRate.rate,
      new_bda_students: currentTakeRate.newMembers,
      avery_signups: currentTakeRate.signups,
      calculation_note: `${currentTakeRate.month}: ${currentTakeRate.signups} trial signups from ${currentTakeRate.newMembers} new BDA students`,
      monthly_history: monthlyTakeRates
    }
  };
}

function calculateProductMetrics(data: SubscriptionData[], trialData: TrialConversionData[], startDate?: string, endDate?: string): ProductMetrics {
  let filteredData = data;
  
  // Apply date filtering if provided
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    filteredData = data.filter(sub => {
      const createdAt = new Date(sub.created_at);
      return createdAt >= start && createdAt <= end;
    });
  }

  const productMetrics: ProductMetrics = {};

  Object.entries(BUDGETDOG_PRODUCTS).forEach(([productId, productName]) => {
    const productData = filteredData.filter(sub => sub.product_id === productId);
    
    if (productData.length === 0) return;

    const active = productData.filter(sub => sub.status === 'active');
    const trialing = productData.filter(sub => sub.status === 'trialing');
    const cancelled = productData.filter(sub => sub.status === 'canceled');

    const mrr = active.reduce((sum, sub) => sum + sub.amount, 0);
    
    // Get trial conversion rate for this product
    const trialConversionData = trialData.find(trial => trial.productId === productId);
    const conversionRate = trialConversionData ? trialConversionData.conversion_rate : 0;

    // Calculate LTV for this product
    const customerRevenue = new Map<string, number>();
    productData.forEach(sub => {
      const current = customerRevenue.get(sub.customer_id) || 0;
      customerRevenue.set(sub.customer_id, current + sub.amount);
    });
    
    const avgLtv = customerRevenue.size > 0 
      ? Array.from(customerRevenue.values()).reduce((sum, val) => sum + val, 0) / customerRevenue.size 
      : 0;

    // Use fixed LTV values for product metrics
    const FIXED_PRODUCT_LTV = {
      'prod_S9H5fDgFs9Lv7y': 215.88, // Millionaire Club: $17.99 * 12
      'prod_S8Y6cYg18JDFLG': 299.88, // Network: $24.99 * 12  
      'prod_RslgGi1t7MBOE6': 215.88  // Academy: $17.99 * 12
    };
    const predictiveLtv = FIXED_PRODUCT_LTV[productId as keyof typeof FIXED_PRODUCT_LTV] || 0;

    productMetrics[productName] = {
      active: active.length,
      trialing: trialing.length,
      cancelled: cancelled.length,
      mrr,
      conversion_rate: conversionRate,
      total: productData.length,
      avg_ltv: avgLtv,
      predictive_ltv: predictiveLtv
    };
  });

  return productMetrics;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Fetch subscription data first, then calculate trial conversions from it
    const data = await fetchStripeData();
    const trialData = await fetchTrialConversionData();
    
    // Get actual conversions and trials for the date range if filtering
    let conversionsInPeriod: number | undefined;
    let trialsInPeriod: number | undefined;
    if (startDate && endDate) {
      conversionsInPeriod = await getSubscriptionConversions(startDate, endDate);
      trialsInPeriod = await calculateTrialsInPeriod(startDate, endDate);
    }
    
    const metrics = calculateMetrics(data, trialData, startDate || undefined, endDate || undefined, conversionsInPeriod, trialsInPeriod);
    const productMetrics = calculateProductMetrics(data, trialData, startDate || undefined, endDate || undefined);

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        productMetrics,
        trialConversions: trialData,
        lastUpdated: new Date().toISOString(),
        cached: cachedData ? Date.now() - cachedData.timestamp < CACHE_DURATION : false
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch metrics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Add cache clearing endpoint
export async function DELETE() {
  cachedData = null;
  return NextResponse.json({ success: true, message: 'Cache cleared' });
}