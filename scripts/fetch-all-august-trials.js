#!/usr/bin/env node

/**
 * Script to fetch ALL trial subscriptions that STARTED in August 2025
 * This includes trials that may have since converted to active or other statuses
 */

const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

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

async function fetchAllAugustTrials() {
  console.log('🔍 Fetching ALL trial subscriptions that STARTED in August 2025...\n');
  console.log('📝 This includes trials that may have since converted to active status\n');
  
  try {
    // Define August 2025 date range
    const augustStart = Math.floor(new Date('2025-08-01T00:00:00Z').getTime() / 1000);
    const augustEnd = Math.floor(new Date('2025-08-31T23:59:59Z').getTime() / 1000);
    
    console.log(`📅 Date range: ${new Date(augustStart * 1000).toISOString()} to ${new Date(augustEnd * 1000).toISOString()}`);
    
    const trialEmails = new Set();
    const trialDetails = [];
    const statusCounts = {};
    const productCounts = {};
    let totalProcessed = 0;
    
    // Fetch all subscriptions created in August (any current status)
    console.log('\n🔄 Fetching all subscriptions created in August...');
    
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
      
      // Get customer email
      const customer = subscription.customer;
      let customerEmail = '';
      
      if (typeof customer === 'string') {
        try {
          const customerDetails = await stripe.customers.retrieve(customer);
          customerEmail = customerDetails.email?.toLowerCase() || '';
        } catch (error) {
          console.warn(`⚠️  Could not fetch customer ${customer}:`, error.message);
          continue;
        }
      } else {
        customerEmail = customer.email?.toLowerCase() || '';
      }
      
      // Skip excluded emails
      if (EXCLUDED_EMAILS.includes(customerEmail)) {
        console.log(`🚫 Excluded test account: ${customerEmail}`);
        continue;
      }
      
      // Add to results (regardless of current status)
      if (customerEmail) {
        trialEmails.add(customerEmail);
        
        const productId = budgetdogItem.price.product;
        const productName = BUDGETDOG_PRODUCTS[productId] || 'Unknown Product';
        
        // Count by status
        statusCounts[subscription.status] = (statusCounts[subscription.status] || 0) + 1;
        
        // Count by product
        productCounts[productName] = (productCounts[productName] || 0) + 1;
        
        trialDetails.push({
          email: customerEmail,
          subscriptionId: subscription.id,
          product: productName,
          productId: productId,
          createdAt: new Date(subscription.created * 1000).toISOString(),
          currentStatus: subscription.status,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          amount: (budgetdogItem.price?.unit_amount || 0) / 100,
          // Determine if this was originally a trial
          wasTrial: subscription.trial_end ? true : false
        });
        
        console.log(`✅ Found subscription: ${customerEmail} - ${productName} (${subscription.status}) - ${subscription.id}`);
      }
    }
    
    console.log(`\n📊 Processing complete!`);
    console.log(`📈 Total subscriptions processed: ${totalProcessed}`);
    console.log(`🎯 Budgetdog subscriptions found: ${trialDetails.length}`);
    console.log(`📧 Unique email addresses: ${trialEmails.size}`);
    
    console.log('\n📋 Current Status Breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} subscriptions`);
    });
    
    console.log('\n📋 Product Breakdown:');
    Object.entries(productCounts).forEach(([product, count]) => {
      console.log(`  ${product}: ${count} subscriptions`);
    });
    
    // Separate by current status
    const stillTrialing = trialDetails.filter(t => t.currentStatus === 'trialing');
    const convertedToActive = trialDetails.filter(t => t.currentStatus === 'active');
    const pastDue = trialDetails.filter(t => t.currentStatus === 'past_due');
    
    console.log('\n📊 Status Analysis:');
    console.log(`  Still Trialing: ${stillTrialing.length} subscriptions`);
    console.log(`  Converted to Active: ${convertedToActive.length} subscriptions`);
    console.log(`  Past Due: ${pastDue.length} subscriptions`);
    
    // Output all email addresses
    console.log('\n📧 All email addresses (regardless of current status):');
    console.log('='.repeat(60));
    Array.from(trialEmails).sort().forEach(email => {
      console.log(email);
    });
    
    // Save detailed results to file
    const fs = require('fs');
    const outputFile = `august-all-trials-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(outputFile, JSON.stringify({
      summary: {
        totalSubscriptions: trialDetails.length,
        uniqueEmails: trialEmails.size,
        dateRange: {
          start: new Date(augustStart * 1000).toISOString(),
          end: new Date(augustEnd * 1000).toISOString()
        },
        currentStatusBreakdown: statusCounts,
        productBreakdown: productCounts,
        analysis: {
          stillTrialing: stillTrialing.length,
          convertedToActive: convertedToActive.length,
          pastDue: pastDue.length
        }
      },
      emails: Array.from(trialEmails).sort(),
      details: trialDetails
    }, null, 2));
    
    console.log(`\n💾 Detailed results saved to: ${outputFile}`);
    
    return {
      emails: Array.from(trialEmails),
      details: trialDetails,
      summary: {
        totalSubscriptions: trialDetails.length,
        uniqueEmails: trialEmails.size,
        currentStatusBreakdown: statusCounts,
        productBreakdown: productCounts
      }
    };
    
  } catch (error) {
    console.error('❌ Error fetching trial data:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  fetchAllAugustTrials()
    .then(results => {
      console.log('\n✅ Script completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { fetchAllAugustTrials };
