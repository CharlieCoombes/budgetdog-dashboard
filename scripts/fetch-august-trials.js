#!/usr/bin/env node

/**
 * Script to fetch all trial subscriptions activated in August 2024
 * from Stripe API and extract customer email addresses
 */

const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

// Initialize Stripe with API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

// Budgetdog product IDs
const BUDGETDOG_PRODUCTS = {
  'prod_S9H5fDgFs9Lv7y': 'Millionaire Club',
  'prod_S8Y6cYg18JDFLG': 'Budgetdog Network',
  'prod_RslgGi1t7MBOE6': 'Budgetdog Academy'
};

// Excluded emails (test accounts)
const EXCLUDED_EMAILS = [
  'brian@averyapp.ai',
  'bean.smith77@gmail.com',
  'briansmith.work578@gmail.com',
  'charlie@averyapp.ai',
  'coombescharlie54@gmail.com',
  'charlie.coombes7@gmail.com'
];

async function fetchAugustTrials() {
  console.log('🔍 Fetching trial subscriptions activated in August 2025...\n');
  
  try {
    // Define August 2025 date range
    const augustStart = Math.floor(new Date('2025-08-01T00:00:00Z').getTime() / 1000);
    const augustEnd = Math.floor(new Date('2025-08-31T23:59:59Z').getTime() / 1000);
    
    console.log(`📅 Date range: ${new Date(augustStart * 1000).toISOString()} to ${new Date(augustEnd * 1000).toISOString()}`);
    
    const trialEmails = new Set();
    const trialDetails = [];
    let totalProcessed = 0;
    
    // Fetch all subscriptions created in August
    console.log('\n🔄 Fetching subscriptions created in August...');
    
    for await (const subscription of stripe.subscriptions.list({
      created: { gte: augustStart, lte: augustEnd },
      limit: 100,
      expand: ['data.items.data.price', 'data.customer']
    })) {
      totalProcessed++;
      
      // Check if this subscription has Budgetdog products
      const budgetdogItem = subscription.items.data.find(
        item => item.price?.product && Object.keys(BUDGETDOG_PRODUCTS).includes(item.price.product)
      );
      
      if (!budgetdogItem) continue;
      
      // Only include trial subscriptions
      if (subscription.status !== 'trialing') continue;
      
      // Get customer email
      const customer = subscription.customer;
      let customerEmail = '';
      
      if (typeof customer === 'string') {
        // Customer is just an ID, need to fetch details
        try {
          const customerDetails = await stripe.customers.retrieve(customer);
          customerEmail = customerDetails.email?.toLowerCase() || '';
        } catch (error) {
          console.warn(`⚠️  Could not fetch customer ${customer}:`, error.message);
          continue;
        }
      } else {
        // Customer is expanded object
        customerEmail = customer.email?.toLowerCase() || '';
      }
      
      // Skip excluded emails
      if (EXCLUDED_EMAILS.includes(customerEmail)) {
        console.log(`🚫 Excluded test account: ${customerEmail}`);
        continue;
      }
      
      // Add to results
      if (customerEmail) {
        trialEmails.add(customerEmail);
        
        const productId = budgetdogItem.price.product;
        const productName = BUDGETDOG_PRODUCTS[productId] || 'Unknown Product';
        
        trialDetails.push({
          email: customerEmail,
          subscriptionId: subscription.id,
          product: productName,
          productId: productId,
          createdAt: new Date(subscription.created * 1000).toISOString(),
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          amount: (budgetdogItem.price?.unit_amount || 0) / 100
        });
        
        console.log(`✅ Found trial: ${customerEmail} - ${productName} (${subscription.id})`);
      }
    }
    
    console.log(`\n📊 Processing complete!`);
    console.log(`📈 Total subscriptions processed: ${totalProcessed}`);
    console.log(`🎯 Budgetdog trial subscriptions found: ${trialDetails.length}`);
    console.log(`📧 Unique email addresses: ${trialEmails.size}`);
    
    // Group by product
    const byProduct = {};
    trialDetails.forEach(trial => {
      if (!byProduct[trial.product]) {
        byProduct[trial.product] = [];
      }
      byProduct[trial.product].push(trial);
    });
    
    console.log('\n📋 Breakdown by product:');
    Object.entries(byProduct).forEach(([product, trials]) => {
      console.log(`  ${product}: ${trials.length} trials`);
    });
    
    // Output results
    console.log('\n📧 All trial email addresses:');
    console.log('='.repeat(50));
    Array.from(trialEmails).sort().forEach(email => {
      console.log(email);
    });
    
    // Save detailed results to file
    const fs = require('fs');
    const outputFile = `august-trials-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(outputFile, JSON.stringify({
      summary: {
        totalTrials: trialDetails.length,
        uniqueEmails: trialEmails.size,
        dateRange: {
          start: new Date(augustStart * 1000).toISOString(),
          end: new Date(augustEnd * 1000).toISOString()
        },
        byProduct: Object.fromEntries(
          Object.entries(byProduct).map(([product, trials]) => [product, trials.length])
        )
      },
      emails: Array.from(trialEmails).sort(),
      details: trialDetails
    }, null, 2));
    
    console.log(`\n💾 Detailed results saved to: ${outputFile}`);
    
    return {
      emails: Array.from(trialEmails),
      details: trialDetails,
      summary: {
        totalTrials: trialDetails.length,
        uniqueEmails: trialEmails.size,
        byProduct: Object.fromEntries(
          Object.entries(byProduct).map(([product, trials]) => [product, trials.length])
        )
      }
    };
    
  } catch (error) {
    console.error('❌ Error fetching trial data:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  fetchAugustTrials()
    .then(results => {
      console.log('\n✅ Script completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { fetchAugustTrials };
