#!/usr/bin/env node

/**
 * Diagnostic script to investigate trial subscription data
 * Checks different date ranges, statuses, and products
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

async function diagnosticCheck() {
  console.log('🔍 DIAGNOSTIC CHECK - Investigating trial data...\n');
  
  try {
    // Check 1: All subscriptions in August (any status)
    console.log('📊 CHECK 1: All subscriptions created in August 2025 (any status)');
    const augustStart = Math.floor(new Date('2025-08-01T00:00:00Z').getTime() / 1000);
    const augustEnd = Math.floor(new Date('2025-08-31T23:59:59Z').getTime() / 1000);
    
    let allAugustSubs = 0;
    let budgetdogAugustSubs = 0;
    const statusCounts = {};
    const productCounts = {};
    
    for await (const subscription of stripe.subscriptions.list({
      created: { gte: augustStart, lte: augustEnd },
      limit: 100,
      expand: ['data.items.data.price']
    })) {
      allAugustSubs++;
      
      // Check if Budgetdog product
      const budgetdogItem = subscription.items.data.find(
        item => item.price?.product && Object.keys(BUDGETDOG_PRODUCTS).includes(item.price.product)
      );
      
      if (budgetdogItem) {
        budgetdogAugustSubs++;
        
        // Count by status
        statusCounts[subscription.status] = (statusCounts[subscription.status] || 0) + 1;
        
        // Count by product
        const productId = budgetdogItem.price.product;
        const productName = BUDGETDOG_PRODUCTS[productId] || 'Unknown';
        productCounts[productName] = (productCounts[productName] || 0) + 1;
      }
    }
    
    console.log(`  Total subscriptions in August: ${allAugustSubs}`);
    console.log(`  Budgetdog subscriptions in August: ${budgetdogAugustSubs}`);
    console.log(`  Status breakdown:`, statusCounts);
    console.log(`  Product breakdown:`, productCounts);
    
    // Check 2: All trial subscriptions (any date)
    console.log('\n📊 CHECK 2: All trial subscriptions (any date)');
    let allTrials = 0;
    const trialProductCounts = {};
    
    for await (const subscription of stripe.subscriptions.list({
      status: 'trialing',
      limit: 100,
      expand: ['data.items.data.price']
    })) {
      allTrials++;
      
      const budgetdogItem = subscription.items.data.find(
        item => item.price?.product && Object.keys(BUDGETDOG_PRODUCTS).includes(item.price.product)
      );
      
      if (budgetdogItem) {
        const productId = budgetdogItem.price.product;
        const productName = BUDGETDOG_PRODUCTS[productId] || 'Unknown';
        trialProductCounts[productName] = (trialProductCounts[productName] || 0) + 1;
      }
    }
    
    console.log(`  Total trial subscriptions: ${allTrials}`);
    console.log(`  Budgetdog trial breakdown:`, trialProductCounts);
    
    // Check 3: Recent subscriptions (last 90 days)
    console.log('\n📊 CHECK 3: Recent subscriptions (last 90 days)');
    const ninetyDaysAgo = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000);
    let recentSubs = 0;
    const recentStatusCounts = {};
    
    for await (const subscription of stripe.subscriptions.list({
      created: { gte: ninetyDaysAgo },
      limit: 100,
      expand: ['data.items.data.price']
    })) {
      const budgetdogItem = subscription.items.data.find(
        item => item.price?.product && Object.keys(BUDGETDOG_PRODUCTS).includes(item.price.product)
      );
      
      if (budgetdogItem) {
        recentSubs++;
        recentStatusCounts[subscription.status] = (recentStatusCounts[subscription.status] || 0) + 1;
      }
    }
    
    console.log(`  Recent Budgetdog subscriptions: ${recentSubs}`);
    console.log(`  Recent status breakdown:`, recentStatusCounts);
    
    // Check 4: All products in Stripe
    console.log('\n📊 CHECK 4: All products in Stripe account');
    const allProducts = await stripe.products.list({ limit: 100 });
    console.log(`  Total products: ${allProducts.data.length}`);
    
    allProducts.data.forEach(product => {
      console.log(`    - ${product.name} (${product.id}) - Active: ${product.active}`);
    });
    
    // Check 5: Sample subscription details
    console.log('\n📊 CHECK 5: Sample subscription details from August');
    let sampleCount = 0;
    for await (const subscription of stripe.subscriptions.list({
      created: { gte: augustStart, lte: augustEnd },
      limit: 10,
      expand: ['data.items.data.price', 'data.customer']
    })) {
      if (sampleCount >= 5) break;
      
      const budgetdogItem = subscription.items.data.find(
        item => item.price?.product && Object.keys(BUDGETDOG_PRODUCTS).includes(item.price.product)
      );
      
      if (budgetdogItem) {
        sampleCount++;
        const customer = subscription.customer;
        let email = '';
        
        if (typeof customer === 'string') {
          try {
            const customerDetails = await stripe.customers.retrieve(customer);
            email = customerDetails.email || 'No email';
          } catch (e) {
            email = 'Error fetching email';
          }
        } else {
          email = customer.email || 'No email';
        }
        
        console.log(`    Sample ${sampleCount}:`);
        console.log(`      ID: ${subscription.id}`);
        console.log(`      Status: ${subscription.status}`);
        console.log(`      Created: ${new Date(subscription.created * 1000).toISOString()}`);
        console.log(`      Customer: ${email}`);
        console.log(`      Product: ${BUDGETDOG_PRODUCTS[budgetdogItem.price.product]}`);
        console.log(`      Amount: $${(budgetdogItem.price?.unit_amount || 0) / 100}`);
        console.log('');
      }
    }
    
  } catch (error) {
    console.error('❌ Diagnostic error:', error);
  }
}

// Run the diagnostic
if (require.main === module) {
  diagnosticCheck()
    .then(() => {
      console.log('\n✅ Diagnostic completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Diagnostic failed:', error.message);
      process.exit(1);
    });
}

module.exports = { diagnosticCheck };
