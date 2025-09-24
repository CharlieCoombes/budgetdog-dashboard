#!/usr/bin/env node

/**
 * Verification script to cross-check August 2025 take rate calculation
 * This script performs multiple validation checks to ensure 100% accuracy
 */

const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

// Function to normalize email addresses
function normalizeEmail(email) {
  return email.toLowerCase().trim().replace(/\s+/g, '');
}

// Function to find potential typos or formatting issues
function findPotentialIssues(emails) {
  const issues = [];
  
  emails.forEach((email, index) => {
    // Check for common issues
    if (email.includes(' ')) {
      issues.push({ type: 'spaces', email, index });
    }
    if (email.includes('..')) {
      issues.push({ type: 'double_dots', email, index });
    }
    if (!email.includes('@')) {
      issues.push({ type: 'no_at_symbol', email, index });
    }
    if (email.endsWith('.')) {
      issues.push({ type: 'ends_with_dot', email, index });
    }
    if (email.includes('@ .')) {
      issues.push({ type: 'space_in_domain', email, index });
    }
  });
  
  return issues;
}

async function verifyTakeRateCalculation() {
  console.log('🔍 COMPREHENSIVE TAKE RATE VERIFICATION');
  console.log('='.repeat(50));
  
  try {
    // Step 1: Re-fetch Avery trial data from Stripe for August 2025
    console.log('\n📊 STEP 1: Re-fetching Avery trial data from Stripe...');
    
    const augustStart = Math.floor(new Date('2025-08-01T00:00:00Z').getTime() / 1000);
    const augustEnd = Math.floor(new Date('2025-08-31T23:59:59Z').getTime() / 1000);
    
    const averyTrialsFromStripe = [];
    
    for await (const subscription of stripe.subscriptions.list({
      created: { gte: augustStart, lte: augustEnd },
      limit: 100,
      expand: ['data.items.data.price', 'data.customer']
    })) {
      const budgetdogItem = subscription.items.data.find(
        item => item.price?.product && ['prod_S9H5fDgFs9Lv7y', 'prod_S8Y6cYg18JDFLG', 'prod_RslgGi1t7MBOE6'].includes(item.price.product)
      );
      
      if (budgetdogItem) {
        const customer = subscription.customer;
        let customerEmail = '';
        
        if (typeof customer === 'string') {
          try {
            const customerDetails = await stripe.customers.retrieve(customer);
            customerEmail = customerDetails.email?.toLowerCase() || '';
          } catch (error) {
            continue;
          }
        } else {
          customerEmail = customer.email?.toLowerCase() || '';
        }
        
        // Exclude test accounts
        const excludedEmails = [
          'brian@averyapp.ai',
          'bean.smith77@gmail.com',
          'briansmith.work578@gmail.com',
          'charlie@averyapp.ai',
          'coombescharlie54@gmail.com',
          'charlie.coombes7@gmail.com'
        ];
        
        if (customerEmail && !excludedEmails.includes(customerEmail)) {
          averyTrialsFromStripe.push({
            email: customerEmail,
            subscriptionId: subscription.id,
            productId: budgetdogItem.price.product,
            status: subscription.status,
            created: new Date(subscription.created * 1000).toISOString()
          });
        }
      }
    }
    
    const uniqueAveryEmails = [...new Set(averyTrialsFromStripe.map(t => normalizeEmail(t.email)))];
    console.log(`✅ Found ${uniqueAveryEmails.length} unique Avery trial emails from Stripe`);
    
    // Step 2: Load Academy signups from user input
    console.log('\n📊 STEP 2: Processing Academy signups...');
    
    const academySignupsRaw = [
      'jkuklock@yahoo.com',
      '802catherine.burke@gmail.com',
      'tripletiger1974@gmail.com',
      'garcia.vanessa.ms@gmail.com',
      'hicks.jessicaj@gmail.com',
      'josephinemboac@gmail.com',
      'lfatica@gmail.com',
      'themelchercompany@gmail.com',
      'karen14938@gmail.com',
      'dimaeasterday@gmail.com',
      'stefanie.m.garner@gmail.com',
      'spearsrebecca7@gmail.com',
      'mcneely426@gmail.com',
      'briancontona@gmail.com',
      'davis.g.smith12@gmail.com',
      'afca8887@gmail.com',
      'collings.heather@gmail.com',
      'thackermeera14@gmail.com',
      'contact@svetlanasburd.com',
      'jessicaleehoward412@gmail.com',
      'casey.reale@gmail.com',
      'suziventurini77@gmail.com',
      'dguerrero1313@gmail.com',
      'davis.g.smith12@gmail.com',
      'davis.g.smith12@gmail.com',
      'afca8887@gmail.com',
      'jsnewsomesr@gmail.com',
      'jaymatthewd@gmail.com',
      'melissamschaefer@yahoo.com',
      'kckranick@gmail.com',
      'khuuandco@gmail.com',
      'agasulewski@yahoo.com',
      'nanz@me.com',
      'smithvidal_@outlook.com',
      'diaz300@gmail.com',
      'chambocam@gmail.com',
      'rocco@ironcladconsultants.com',
      'maeganlm@gmail.com',
      'chowpaypal@gmail.com',
      'elizabeth.c.welch@ .com',
      'tiffanydepley@gmail.com',
      'ajoliehill@gmail.com',
      'bgallardo28@gmail.com',
      'jmunji@gmail.com',
      'badriya.chandoo@gmail.com',
      'jacobgoldberg1@yahoo.com',
      'rodde194@gmail.com',
      'szomalt@gmail.com',
      'lurchmega5@gmail.com',
      'desbahroseyazzie@gmail.com',
      'jasl2088@gmail.com',
      'fitnessgurl21@yahoo.com',
      'hoops1298@yahoo.com',
      'sessumshhh@yahoo.com',
      'diaz300@gmail.com',
      'elizabethmajerick@gmail.com',
      'cthompson@fblglaw.com',
      'becargallego@gmail.com',
      'tracyteves@gmail.com',
      'kristarpatrick@gmail.com',
      'ktinvest@yahoo.com',
      'quinnjs74@gmail.com',
      'happyemily7@gmail.com',
      'jamieraerush@gmail.com',
      'zachb10@live.com',
      'chopkins032793@gmail.com',
      'janaraejones3@gmail.com',
      'dokedkt3@gmail.com',
      'jeremy80wv@yahoo.com',
      'tysonrupa@gmail.com',
      'dergie7@gmail.com',
      'jerrikajoybsn@gmail.com',
      'camimartin.310@gmail.com',
      'jasoncvargas@gmail.com',
      'dguerrero1313@gmail.com',
      'mmaeva@san.rr.com',
      'mazda_luvr128@yahoo.com'
    ];
    
    // Step 3: Data quality checks
    console.log('\n📊 STEP 3: Data quality checks...');
    
    // Check for formatting issues in Academy list
    const academyIssues = findPotentialIssues(academySignupsRaw);
    if (academyIssues.length > 0) {
      console.log('⚠️  POTENTIAL ISSUES IN ACADEMY SIGNUPS:');
      academyIssues.forEach(issue => {
        console.log(`  ${issue.type}: "${issue.email}" at position ${issue.index}`);
      });
    } else {
      console.log('✅ No formatting issues found in Academy signups');
    }
    
    // Normalize Academy emails and find duplicates
    const academyNormalized = academySignupsRaw.map(normalizeEmail);
    const academyUnique = [...new Set(academyNormalized)];
    const academyDuplicates = academyNormalized.filter((email, index, arr) => 
      arr.indexOf(email) !== index
    );
    
    console.log(`📧 Academy emails: ${academySignupsRaw.length} total, ${academyUnique.length} unique`);
    if (academyDuplicates.length > 0) {
      console.log('⚠️  DUPLICATES IN ACADEMY LIST:', [...new Set(academyDuplicates)]);
    }
    
    // Step 4: Cross-reference with Stripe Academy subscriptions
    console.log('\n📊 STEP 4: Cross-referencing Academy signups with Stripe...');
    
    const academyInStripe = [];
    const academyNotInStripe = [];
    
    for (const email of academyUnique) {
      const foundInStripe = averyTrialsFromStripe.find(trial => 
        normalizeEmail(trial.email) === email
      );
      
      if (foundInStripe) {
        academyInStripe.push({
          email,
          stripeData: foundInStripe
        });
      } else {
        academyNotInStripe.push(email);
      }
    }
    
    console.log(`✅ ${academyInStripe.length} Academy signups found in Stripe Avery trials`);
    console.log(`⚠️  ${academyNotInStripe.length} Academy signups NOT found in Stripe Avery trials`);
    
    if (academyNotInStripe.length > 0) {
      console.log('\n📧 ACADEMY SIGNUPS NOT IN AVERY TRIALS:');
      academyNotInStripe.slice(0, 10).forEach(email => console.log(`  ${email}`));
      if (academyNotInStripe.length > 10) {
        console.log(`  ... and ${academyNotInStripe.length - 10} more`);
      }
    }
    
    // Step 5: Calculate verified take rate
    console.log('\n📊 STEP 5: Verified take rate calculation...');
    
    const overlap = academyInStripe.length;
    const takeRate = (overlap / uniqueAveryEmails.length) * 100;
    
    console.log('\n🎯 VERIFIED RESULTS:');
    console.log('='.repeat(30));
    console.log(`Avery trial users (from Stripe): ${uniqueAveryEmails.length}`);
    console.log(`Academy signups (unique): ${academyUnique.length}`);
    console.log(`Verified overlap: ${overlap}`);
    console.log(`Verified take rate: ${takeRate.toFixed(1)}%`);
    
    // Step 6: Additional verification - check for Academy product subscriptions in Stripe
    console.log('\n📊 STEP 6: Checking Academy product subscriptions in Stripe...');
    
    const academyProductId = 'prod_RslgGi1t7MBOE6';
    const academySubsInStripe = averyTrialsFromStripe.filter(trial => 
      trial.productId === academyProductId
    ).map(trial => normalizeEmail(trial.email));
    
    const uniqueAcademyInStripe = [...new Set(academySubsInStripe)];
    
    console.log(`📊 Academy subscriptions in Stripe (August): ${uniqueAcademyInStripe.length}`);
    
    // Compare with user-provided list
    const inBothLists = academyUnique.filter(email => uniqueAcademyInStripe.includes(email));
    const onlyInUserList = academyUnique.filter(email => !uniqueAcademyInStripe.includes(email));
    const onlyInStripe = uniqueAcademyInStripe.filter(email => !academyUnique.includes(email));
    
    console.log(`📊 In both lists: ${inBothLists.length}`);
    console.log(`📊 Only in user list: ${onlyInUserList.length}`);
    console.log(`📊 Only in Stripe: ${onlyInStripe.length}`);
    
    // Final summary
    console.log('\n📋 VERIFICATION SUMMARY:');
    console.log('='.repeat(40));
    console.log(`✅ Avery trials verified: ${uniqueAveryEmails.length}`);
    console.log(`✅ Academy signups verified: ${academyUnique.length}`);
    console.log(`✅ Overlap verified: ${overlap}`);
    console.log(`✅ Take rate verified: ${takeRate.toFixed(1)}%`);
    
    if (academyIssues.length === 0 && academyDuplicates.length === 0) {
      console.log('✅ Data quality: PASSED');
    } else {
      console.log('⚠️  Data quality: ISSUES FOUND (see above)');
    }
    
    // Save verification results
    const fs = require('fs');
    const verificationResults = {
      timestamp: new Date().toISOString(),
      verified: {
        averyTrials: uniqueAveryEmails.length,
        academySignups: academyUnique.length,
        overlap: overlap,
        takeRate: takeRate
      },
      dataQuality: {
        academyIssues: academyIssues,
        academyDuplicates: [...new Set(academyDuplicates)],
        academyNotInStripe: academyNotInStripe
      },
      crossReference: {
        academyInStripe: uniqueAcademyInStripe.length,
        inBothLists: inBothLists.length,
        onlyInUserList: onlyInUserList.length,
        onlyInStripe: onlyInStripe.length
      }
    };
    
    fs.writeFileSync('take-rate-verification.json', JSON.stringify(verificationResults, null, 2));
    console.log('\n💾 Verification results saved to: take-rate-verification.json');
    
    return verificationResults;
    
  } catch (error) {
    console.error('❌ Verification error:', error);
    throw error;
  }
}

// Run verification
if (require.main === module) {
  verifyTakeRateCalculation()
    .then(() => {
      console.log('\n✅ Verification completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Verification failed:', error.message);
      process.exit(1);
    });
}

module.exports = { verifyTakeRateCalculation };
