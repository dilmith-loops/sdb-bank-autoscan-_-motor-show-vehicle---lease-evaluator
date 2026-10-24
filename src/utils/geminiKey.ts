import fs from 'fs';
import path from 'path';

/**
 * Robust helper to retrieve GEMINI_API_KEY from environment or directly from .env file
 */
export function getGeminiApiKey(): string | undefined {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
    return process.env.GEMINI_API_KEY;
  }

  // Fallback: read .env file directly from current working directory or process root
  try {
    const candidatePaths = [
      path.resolve(process.cwd(), '.env'),
      path.resolve(process.cwd(), '..', '.env'),
    ];

    for (const envPath of candidatePaths) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        for (const line of content.split('\n')) {
          const match = line.match(/^\s*GEMINI_API_KEY\s*=\s*(.*)?\s*$/);
          if (match) {
            let val = (match[1] || '').trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (val) {
              process.env.GEMINI_API_KEY = val;
              return val;
            }
          }
        }
      }
    }
  } catch (e: any) {
    console.warn('Direct .env reading failed:', e?.message);
  }

  return undefined;
}
