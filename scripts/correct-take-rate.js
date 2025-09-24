#!/usr/bin/env node

/**
 * CORRECT Take Rate Calculation
 * Question: Of Academy users in August 2025, how many also started Avery trials?
 */

const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

// Budgetdog Academy signups from August 2025 (provided by user)
const academySignups = [
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

// Function to normalize email addresses
function normalizeEmail(email) {
  return email.toLowerCase().trim().replace(/\s+/g, '');
}

async function calculateCorrectTakeRate() {
  console.log('🎯 CORRECT TAKE RATE CALCULATION');
  console.log('='.repeat(50));
  console.log('Question: Of Academy users in August 2025, how many also started Avery trials?');
  console.log('');
  
  try {
    // Step 1: Process Academy signups
    console.log('📊 STEP 1: Processing Academy signups...');
    
    // Fix the formatting issue
    const academySignupsFixed = academySignups.map(email => 
      email === 'elizabeth.c.welch@ .com' ? 'elizabeth.c.welch@gmail.com' : email
    );
    
    const academyNormalized = academySignupsFixed.map(normalizeEmail);
    const academyUnique = [...new Set(academyNormalized)];
    
    console.log(`📧 Academy signups: ${academySignupsFixed.length} total, ${academyUnique.length} unique`);
    
    // Check for duplicates
    const duplicates = academyNormalized.filter((email, index, arr) => 
      arr.indexOf(email) !== index
    );
    if (duplicates.length > 0) {
      console.log(`⚠️  Duplicates removed: ${[...new Set(duplicates)].join(', ')}`);
    }
    
    // Step 2: Fetch Avery trials from Stripe (August 2025)
    console.log('\n📊 STEP 2: Fetching Avery trials from Stripe (August 2025)...');
    
    const augustStart = Math.floor(new Date('2025-08-01T00:00:00Z').getTime() / 1000);
    const augustEnd = Math.floor(new Date('2025-08-31T23:59:59Z').getTime() / 1000);
    
    console.log(`📅 Date range: ${new Date(augustStart * 1000).toISOString()} to ${new Date(augustEnd * 1000).toISOString()}`);
    
    const averyTrials = [];
    
    // Fetch all subscriptions created in August
    for await (const subscription of stripe.subscriptions.list({
      created: { gte: augustStart, lte: augustEnd },
      limit: 100,
      expand: ['data.items.data.price', 'data.customer']
    })) {
      // Check if this subscription has Budgetdog products
      const budgetdogItem = subscription.items.data.find(
        item => item.price?.product && ['prod_S9H5fDgFs9Lv7y', 'prod_S8Y6cYg18JDFLG', 'prod_RslgGi1t7MBOE6'].includes(item.price.product)
      );
      
      if (budgetdogItem) {
        // Get customer email
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
          averyTrials.push({
            email: normalizeEmail(customerEmail),
            subscriptionId: subscription.id,
            productId: budgetdogItem.price.product,
            status: subscription.status,
            created: new Date(subscription.created * 1000).toISOString()
          });
        }
      }
    }
    
    const averyUnique = [...new Set(averyTrials.map(t => t.email))];
    console.log(`📧 Avery trials: ${averyTrials.length} total, ${averyUnique.length} unique`);
    
    // Step 3: Find overlap
    console.log('\n📊 STEP 3: Finding overlap...');
    
    const overlap = academyUnique.filter(email => averyUnique.includes(email));
    
    console.log(`🎯 Academy users who also started Avery trials: ${overlap.length}`);
    
    // Step 4: Calculate take rate
    console.log('\n📊 STEP 4: Calculating take rate...');
    
    const takeRate = (overlap.length / academyUnique.length) * 100;
    
    console.log('\n🎯 CORRECT TAKE RATE RESULTS:');
    console.log('='.repeat(40));
    console.log(`Academy users (August 2025): ${academyUnique.length}`);
    console.log(`Avery trials (August 2025): ${averyUnique.length}`);
    console.log(`Overlap (Academy users who also did Avery): ${overlap.length}`);
    console.log(`Take Rate: ${overlap.length}/${academyUnique.length} = ${takeRate.toFixed(1)}%`);
    
    console.log('\n📧 ACADEMY USERS WHO ALSO STARTED AVERY TRIALS:');
    console.log('='.repeat(50));
    overlap.sort().forEach(email => {
      console.log(email);
    });
    
    // Step 5: Additional analysis
    console.log('\n📊 STEP 5: Additional analysis...');
    
    const academyOnly = academyUnique.filter(email => !averyUnique.includes(email));
    const averyOnly = averyUnique.filter(email => !academyUnique.includes(email));
    
    console.log(`📧 Academy users who did NOT start Avery trials: ${academyOnly.length}`);
    console.log(`📧 Avery trial users who did NOT start Academy: ${averyOnly.length}`);
    
    // Breakdown by product for overlap
    console.log('\n📊 Product breakdown for overlapping users:');
    const overlapDetails = overlap.map(email => {
      const trial = averyTrials.find(t => t.email === email);
      return {
        email,
        productId: trial?.productId,
        status: trial?.status
      };
    });
    
    const productBreakdown = {};
    overlapDetails.forEach(detail => {
      const productName = {
        'prod_S9H5fDgFs9Lv7y': 'Millionaire Club',
        'prod_S8Y6cYg18JDFLG': 'Budgetdog Network', 
        'prod_RslgGi1t7MBOE6': 'Budgetdog Academy'
      }[detail.productId] || 'Unknown';
      
      productBreakdown[productName] = (productBreakdown[productName] || 0) + 1;
    });
    
    Object.entries(productBreakdown).forEach(([product, count]) => {
      console.log(`  ${product}: ${count} users`);
    });
    
    // Save results
    const fs = require('fs');
    const results = {
      timestamp: new Date().toISOString(),
      question: 'Of Academy users in August 2025, how many also started Avery trials?',
      results: {
        academyUsers: academyUnique.length,
        averyTrials: averyUnique.length,
        overlap: overlap.length,
        takeRate: takeRate
      },
      overlapEmails: overlap,
      academyOnlyEmails: academyOnly.slice(0, 10), // First 10 for brevity
      averyOnlyEmails: averyOnly.slice(0, 10), // First 10 for brevity
      productBreakdown: productBreakdown
    };
    
    fs.writeFileSync('correct-take-rate-results.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Results saved to: correct-take-rate-results.json');
    
    return results;
    
  } catch (error) {
    console.error('❌ Error calculating take rate:', error);
    throw error;
  }
}

// Run the calculation
if (require.main === module) {
  calculateCorrectTakeRate()
    .then(() => {
      console.log('\n✅ Correct take rate calculation completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Calculation failed:', error.message);
      process.exit(1);
    });
}

module.exports = { calculateCorrectTakeRate };
