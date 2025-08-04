#!/usr/bin/env node

/**
 * Monthly Take Rate Calculator
 * 
 * This script calculates the take rate by cross-checking new member emails
 * from Budgetdog Academy against Stripe trial signups.
 * 
 * Usage:
 * 1. Create a file called 'new-members.txt' with one email per line
 * 2. Run: node scripts/calculate-take-rate.js
 */

const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

// Budgetdog Academy product ID
const ACADEMY_PRODUCT_ID = 'prod_RslgGi1t7MBOE6';

async function calculateTakeRate() {
  try {
    console.log('🔄 Starting take rate calculation...\n');

    // 1. Read new member emails from file
    const emailsFile = path.join(__dirname, 'new-members.txt');
    
    if (!fs.existsSync(emailsFile)) {
      console.error('❌ Error: Please create a file called "new-members.txt" in the scripts folder');
      console.error('   Add one email per line for all new Budgetdog Academy members');
      process.exit(1);
    }

    const emailsContent = fs.readFileSync(emailsFile, 'utf8');
    const newMemberEmails = emailsContent
      .split('\n')
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 0 && email.includes('@'));

    console.log(`📧 Found ${newMemberEmails.length} new member emails`);

    if (newMemberEmails.length === 0) {
      console.error('❌ No valid emails found in new-members.txt');
      process.exit(1);
    }

    // 2. Get all Academy subscriptions from Stripe
    console.log('🔍 Searching Stripe for Academy trials...');
    
    const academyTrials = [];
    const matchedEmails = new Set();

    // Search through subscriptions to find Academy trials
    for await (const subscription of stripe.subscriptions.list({
      limit: 100,
      expand: ['data.items.data.price', 'data.customer']
    })) {
      // Check if this subscription is for Academy
      const hasAcademyProduct = subscription.items.data.some(
        item => item.price?.product === ACADEMY_PRODUCT_ID
      );

      if (hasAcademyProduct) {
        const customer = subscription.customer;
        const customerEmail = customer.email?.toLowerCase();

        if (customerEmail && newMemberEmails.includes(customerEmail)) {
          academyTrials.push({
            email: customerEmail,
            status: subscription.status,
            created: new Date(subscription.created * 1000),
            subscriptionId: subscription.id
          });
          matchedEmails.add(customerEmail);
        }
      }
    }

    // 3. Calculate results
    const totalNewMembers = newMemberEmails.length;
    const totalTrialSignups = academyTrials.length;
    const takeRate = totalNewMembers > 0 ? (totalTrialSignups / totalNewMembers) * 100 : 0;

    // 4. Display results
    console.log('\n' + '='.repeat(50));
    console.log('📊 TAKE RATE CALCULATION RESULTS');
    console.log('='.repeat(50));
    console.log(`Total new Budgetdog Academy members: ${totalNewMembers}`);
    console.log(`Members who started Avery trials: ${totalTrialSignups}`);
    console.log(`Take Rate: ${takeRate.toFixed(1)}%`);
    console.log('='.repeat(50));

    // 5. Show detailed breakdown
    if (academyTrials.length > 0) {
      console.log('\n📋 Trial signups breakdown:');
      academyTrials.forEach((trial, index) => {
        console.log(`${index + 1}. ${trial.email} - ${trial.status} (${trial.created.toDateString()})`);
      });
    }

    // 6. Show emails that didn't sign up (for reference)
    const noTrialEmails = newMemberEmails.filter(email => !matchedEmails.has(email));
    if (noTrialEmails.length > 0) {
      console.log(`\n📝 Members who didn't start trials (${noTrialEmails.length}):`);
      noTrialEmails.slice(0, 10).forEach((email, index) => {
        console.log(`${index + 1}. ${email}`);
      });
      if (noTrialEmails.length > 10) {
        console.log(`   ... and ${noTrialEmails.length - 10} more`);
      }
    }

    // 7. Save results to file
    const resultsFile = path.join(__dirname, `take-rate-${new Date().toISOString().split('T')[0]}.json`);
    const results = {
      date: new Date().toISOString(),
      totalNewMembers,
      totalTrialSignups,
      takeRate: parseFloat(takeRate.toFixed(1)),
      trialSignups: academyTrials,
      noTrialEmails
    };

    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${resultsFile}`);

    // 8. Instructions for updating dashboard
    console.log('\n🔧 TO UPDATE DASHBOARD:');
    console.log('1. Update the hardcoded values in src/app/api/metrics/route.ts');
    console.log(`2. Change take_rate: ${takeRate.toFixed(1)}`);
    console.log(`3. Change avery_signups: ${totalTrialSignups}`);
    console.log(`4. Change new_bda_students: ${totalNewMembers}`);

  } catch (error) {
    console.error('❌ Error calculating take rate:', error.message);
    process.exit(1);
  }
}

// Run the calculation
if (require.main === module) {
  calculateTakeRate();
}

module.exports = { calculateTakeRate };