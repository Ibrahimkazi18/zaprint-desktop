/**
 * SECURITY: Load .env file into process.env BEFORE any other imports.
 * This file MUST be imported first in main.ts.
 * This is needed because secret keys (SUPABASE_SERVICE_ROLE_KEY, RAZORPAY_KEY_SECRET)
 * intentionally do NOT use the VITE_ prefix to prevent client-side exposure.
 * Vite only auto-injects VITE_* vars, so we load the rest manually here.
 */
const _fs = require('fs');
const _path = require('path');

function loadEnvFile() {
  // In development, .env is in the project root. In production, it's relative to the app.
  const envPaths = [
    _path.resolve(process.cwd(), '.env'),
    _path.resolve(__dirname, '..', '.env'),
    _path.resolve(__dirname, '.env'),
  ];
  
  for (const envPath of envPaths) {
    if (_fs.existsSync(envPath)) {
      const content = _fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        // Skip comments and empty lines
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) continue;
        const key = trimmed.slice(0, eqIndex).trim();
        const value = trimmed.slice(eqIndex + 1).trim();
        // Only set if not already defined (don't override system env vars)
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
      console.log('[Security] Loaded .env from:', envPath);
      return;
    }
  }
  console.warn('[Security] No .env file found — secret keys may be missing');
}

loadEnvFile();
