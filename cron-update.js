#!/usr/bin/env node

/**
 * Background cron job to keep dashboard cache warm
 * Run this every 15 minutes to ensure fast loading
 * 
 * Usage: node cron-update.js
 * Or set up as a cron job: */15 * * * * node /path/to/cron-update.js
 */

async function warmCache() {
  try {
    console.log('🔄 Warming dashboard cache...');
    
    const response = await fetch('https://reporting.averyapp.ai/api/metrics');
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Cache warmed successfully');
      console.log(`📊 Found ${data.data.metrics.total_records} subscriptions`);
    } else {
      console.error('❌ Failed to warm cache:', data.error);
    }
  } catch (error) {
    console.error('❌ Error warming cache:', error.message);
  }
}

warmCache();