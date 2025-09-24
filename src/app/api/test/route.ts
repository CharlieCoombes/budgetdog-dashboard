import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🆕 TEST ENDPOINT CALLED - CONFIRMING NEW CODE IS ACTIVE 🆕');
  return NextResponse.json({
    success: true,
    message: 'NEW CODE VERSION IS RUNNING',
    timestamp: new Date().toISOString(),
    version: '2.0-fixed-pagination'
  });
}