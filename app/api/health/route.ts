import { NextResponse } from 'next/server';
import { getGeminiApiKey } from '@/src/utils/geminiKey';

/**
 * Health check endpoint
 */
export function GET() {
  const key = getGeminiApiKey();
  const isConfigured = Boolean(key && key.trim() !== '' && !key.includes('your_actual'));

  return NextResponse.json({
    status: 'ok',
    service: 'SDB Bank AutoScan Backend',
    timestamp: new Date().toISOString(),
    geminiConfigured: isConfigured,
    keyPrefix: isConfigured && key ? key.substring(0, 6) + '...' : 'none',
  });
}
