import { NextResponse } from 'next/server';

/**
 * Health check endpoint
 */
export function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'SDB Bank AutoScan Backend',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
}
