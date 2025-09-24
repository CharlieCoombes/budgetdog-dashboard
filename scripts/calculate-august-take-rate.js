#!/usr/bin/env node

/**
 * Script to calculate August 2025 take rate for Budgetdog Academy
 * Compares Avery trial users vs Budgetdog Academy signups
 */

// Avery trial users from August 2025 (85 unique emails)
const averyTrialUsers = [
  '2haimik@gmail.com',
  '79reynol@gmail.com',
  'adowney28@gmail.com',
  'ajoliehill@gmail.com',
  'andrea.connectedenergy@gmail.com',
  'andrewjkelleher@yahoo.com',
  'anthony.pechal@gmail.com',
  'averittjk@gmail.com',
  'bachmanzac@gmail.com',
  'barve_vj@yahoo.com',
  'bjehlen5@gmail.com',
  'bondbudgetdog007@gmail.com',
  'brokenandbeautiful@msn.com',
  'catherinestearns452@gmail.com',
  'charlton.briana@yahoo.com',
  'charltonbriana107@gmail.com',
  'chowpaypal@gmail.com',
  'collings.heather@gmail.com',
  'contact@hicravings.com',
  'csmostow@gmail.com',
  'curtink21@gmail.com',
  'davis.g.smith12@gmail.com',
  'devin@devinmcpaul.com',
  'dfb1016@gmail.com',
  'drewjskrocki@gmail.com',
  'elizabeth.c.welch@gmail.com',
  'emily.chebuhar.002@gmail.com',
  'eolittlemarket@gmail.com',
  'garcia.vanessa.ms@gmail.com',
  'ggunter3680@gmail.com',
  'graham.smith@vml.com',
  'griffin.joyner123@gmail.com',
  'heckrealtygroup@gmail.com',
  'hicks.jessicaj@gmail.com',
  'hollyaforrest@gmail.com',
  'house.investments3@gmail.com',
  'jacobgoldberg1@yahoo.com',
  'jadamski24@mail.com',
  'jaymatthewd@gmail.com',
  'jennifer@elevatecapitalproperties.com',
  'jessica.mclemore.15@gmail.com',
  'jhirwin10109@gmail.com',
  'jkuklock@yahoo.com',
  'jordanpeel99@gmail.com',
  'jpanagnos@gmail.com',
  'kcduffy15@gmail.com',
  'kdyoga@gmail.com',
  'kellijoiner@gmail.com',
  'kellysafrit@gmail.com',
  'kfilimonchuk@hitt-gc.com',
  'kfwitters@gmail.com',
  'kimberlybryantinteriors@gmail.com',
  'lcurryg@yahoo.com',
  'lcurrygarza@gmail.com',
  'leah.keith@gmail.com',
  'leendqueen@aol.com',
  'lheck@jamesonsir.com',
  'mccullochcarley@gmail.com',
  'mcneely426@gmail.com',
  'medicdi@hotmail.com',
  'mkrichard2023@gmail.com',
  'msankalp@gmail.com',
  'msones.fortis@gmail.com',
  'naslionakis@gmail.com',
  'nasstassia@me.com',
  'nettie0804@yahoo.com',
  'nico@kogoodies.com',
  'nolmil5399@gmail.com',
  'potomacfurbabies@gmail.com',
  'preetijhujj@gmail.com',
  'sarah.vowell@cbauto.net',
  'shanelleilucas@yahoo.com',
  'sheree.pettigrew@yahoo.com',
  'smithvidal_@outlook.com',
  'stacy.veit@mercy.net',
  'stefanie.m.garner@gmail.com',
  'theodotou2014@gmail.com',
  'toby.hearsey@gmail.com',
  'tony_paradis@hotmail.com',
  'tothemax@2tmllc.com',
  'vanvleet.trevor@gmail.com',
  'warpath.41.beacon@icloud.com',
  'yelamir16@gmail.com',
  'zachb10@live.com',
  'zmirza01@gmail.com'
];

// Budgetdog Academy signups from August (provided by user)
const budgetdogAcademySignups = [
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

function calculateTakeRate() {
  console.log('📊 AUGUST 2025 TAKE RATE CALCULATION');
  console.log('='.repeat(50));
  
  // Convert to lowercase and remove duplicates
  const averyUsers = [...new Set(averyTrialUsers.map(email => email.toLowerCase()))];
  const academySignups = [...new Set(budgetdogAcademySignups.map(email => email.toLowerCase()))];
  
  console.log(`📈 Avery trial users (August): ${averyUsers.length}`);
  console.log(`📈 Budgetdog Academy signups (August): ${academySignups.length}`);
  
  // Find overlap
  const overlap = academySignups.filter(email => averyUsers.includes(email));
  
  console.log(`\n🎯 OVERLAP ANALYSIS:`);
  console.log(`📧 Emails in both lists: ${overlap.length}`);
  
  // Calculate take rate
  const takeRate = (overlap.length / averyUsers.length) * 100;
  
  console.log(`\n📊 TAKE RATE CALCULATION:`);
  console.log(`Take Rate = (Overlap / Avery Users) × 100`);
  console.log(`Take Rate = (${overlap.length} / ${averyUsers.length}) × 100`);
  console.log(`Take Rate = ${takeRate.toFixed(1)}%`);
  
  console.log(`\n📧 EMAILS IN BOTH LISTS:`);
  console.log('='.repeat(30));
  overlap.sort().forEach(email => {
    console.log(email);
  });
  
  // Find emails in Academy signups but NOT in Avery trials
  const academyOnly = academySignups.filter(email => !averyUsers.includes(email));
  console.log(`\n📧 EMAILS IN ACADEMY SIGNUPS BUT NOT AVERY TRIALS (${academyOnly.length}):`);
  console.log('='.repeat(60));
  academyOnly.sort().forEach(email => {
    console.log(email);
  });
  
  // Find emails in Avery trials but NOT in Academy signups
  const averyOnly = averyUsers.filter(email => !academySignups.includes(email));
  console.log(`\n📧 EMAILS IN AVERY TRIALS BUT NOT ACADEMY SIGNUPS (${averyOnly.length}):`);
  console.log('='.repeat(60));
  averyOnly.sort().forEach(email => {
    console.log(email);
  });
  
  // Summary
  console.log(`\n📋 SUMMARY:`);
  console.log('='.repeat(20));
  console.log(`Avery trial users: ${averyUsers.length}`);
  console.log(`Academy signups: ${academySignups.length}`);
  console.log(`Overlap: ${overlap.length}`);
  console.log(`Take Rate: ${takeRate.toFixed(1)}%`);
  
  return {
    averyUsers: averyUsers.length,
    academySignups: academySignups.length,
    overlap: overlap.length,
    takeRate: takeRate,
    overlapEmails: overlap,
    academyOnly: academyOnly,
    averyOnly: averyOnly
  };
}

// Run the calculation
if (require.main === module) {
  const results = calculateTakeRate();
  
  // Save results to file
  const fs = require('fs');
  const outputFile = `august-take-rate-${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(outputFile, JSON.stringify({
    summary: {
      averyTrialUsers: results.averyUsers,
      academySignups: results.academySignups,
      overlap: results.overlap,
      takeRate: results.takeRate,
      month: 'August 2025'
    },
    overlapEmails: results.overlapEmails,
    academyOnlyEmails: results.academyOnly,
    averyOnlyEmails: results.averyOnly
  }, null, 2));
  
  console.log(`\n💾 Results saved to: ${outputFile}`);
  console.log('\n✅ Take rate calculation completed!');
}

module.exports = { calculateTakeRate };
