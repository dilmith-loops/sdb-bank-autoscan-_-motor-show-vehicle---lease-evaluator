// CommonJS on purpose: CloudLinux Passenger loads the startup file with require()
const { createServer } = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('url');
const next = require('next');

// 1. Directly parse .env file from __dirname to guarantee environment variables are available
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of envLines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = (match[2] || '').trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[match[1]] = val;
      }
    }
  }
} catch (e) {
  console.warn('Direct .env reading failed in server.js:', e.message);
}

// 2. Also try @next/env as standard fallback
try {
  const { loadEnvConfig } = require('@next/env');
  loadEnvConfig(__dirname);
} catch (e) {
  // Ignored
}

// Ensure default basePath is set
if (!process.env.NEXT_PUBLIC_BASE_PATH) {
  process.env.NEXT_PUBLIC_BASE_PATH = '/sdb';
}

// Global exception guards to prevent worker death
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
  try {
    fs.appendFileSync(
      path.join(__dirname, 'server_error.log'),
      `[${new Date().toISOString()}] Uncaught Exception: ${err && err.stack ? err.stack : err}\n`
    );
  } catch (_) {}
});

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
  try {
    fs.appendFileSync(
      path.join(__dirname, 'server_error.log'),
      `[${new Date().toISOString()}] Unhandled Rejection: ${reason && reason.stack ? reason.stack : reason}\n`
    );
  } catch (_) {}
});

// Check if production build exists; if not, attempt build on-the-fly
const buildIdFile = path.join(__dirname, '.next', 'BUILD_ID');
if (!fs.existsSync(buildIdFile)) {
  console.log('> .next/BUILD_ID not detected. Attempting automatic build with npm run build...');
  try {
    const { execSync } = require('child_process');
    const nodeBinDir = '/opt/alt/alt-nodejs20/root/usr/bin';
    const npmPath = path.join(nodeBinDir, 'npm');
    const npmBin = fs.existsSync(npmPath) ? npmPath : 'npm';
    const envPath = fs.existsSync(nodeBinDir) ? `${nodeBinDir}:${process.env.PATH || ''}` : process.env.PATH;
    execSync(`${npmBin} run build`, {
      cwd: __dirname,
      stdio: 'inherit',
      env: { ...process.env, PATH: envPath },
      timeout: 120000,
    });
    console.log('> Automatic production build completed.');
  } catch (buildErr) {
    console.error('> Automatic build failed:', buildErr.message);
  }
}

// Phusion Passenger passes process.env.PORT which may be a numeric port, a unix socket path, or 'passenger'
const rawPort = process.env.PORT;
const port = rawPort && !isNaN(Number(rawPort)) ? parseInt(rawPort, 10) : (rawPort || 3000);

// Ensure Next.js always runs in production mode and resolves .next relative to server.js directory
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

// Helper to reliably serve static assets directly from .next/static
function tryServeStatic(req, res) {
  const urlPath = (req.url || '').split('?')[0];
  if (!urlPath.includes('/_next/static/')) return false;

  const relStatic = urlPath.replace(/^(\/sdb)?\/_next\/static\//, '');
  let filePath = path.join(__dirname, '.next', 'static', relStatic);

  // If exact file exists, serve it
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    // Special fallback for webpack runtime chunks (webpack-*.js)
    if (relStatic.startsWith('chunks/webpack-')) {
      const chunksDir = path.join(__dirname, '.next', 'static', 'chunks');
      if (fs.existsSync(chunksDir)) {
        const files = fs.readdirSync(chunksDir);
        const activeWebpack = files.find((f) => f.startsWith('webpack-') && f.endsWith('.js'));
        if (activeWebpack) {
          filePath = path.join(chunksDir, activeWebpack);
        }
      }
    }
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const contentType =
      ext === '.js'
        ? 'application/javascript; charset=UTF-8'
        : ext === '.css'
        ? 'text/css; charset=UTF-8'
        : ext === '.json'
        ? 'application/json'
        : ext === '.png'
        ? 'image/png'
        : ext === '.jpg' || ext === '.jpeg'
        ? 'image/jpeg'
        : ext === '.svg'
        ? 'image/svg+xml'
        : 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    fs.createReadStream(filePath).pipe(res);
    return true;
  }

  return false;
}

app
  .prepare()
  .then(() => {
    const server = createServer(async (req, res) => {
      try {
        // Fast direct static serving for Next.js assets
        if (tryServeStatic(req, res)) {
          return;
        }

        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request:', req.url, err);
        try {
          fs.appendFileSync(
            path.join(__dirname, 'server_error.log'),
            `[${new Date().toISOString()}] ${req.url} -> ${err && err.stack ? err.stack : err}\n`
          );
        } catch (_) {}
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`Internal Server Error: ${err && err.message ? err.message : String(err)}`);
      }
    });

    server.on('error', (err) => {
      console.error('[SERVER LISTEN ERROR]', err);
      try {
        fs.appendFileSync(
          path.join(__dirname, 'startup_error.log'),
          `[${new Date().toISOString()}] Listen error: ${err && err.stack ? err.stack : err}\n`
        );
      } catch (_) {}
    });

    server.listen(port, () => {
      console.log(`> SDB AutoScan production server ready on port/socket: ${port}`);
      console.log(`> Accessible under base path: /sdb`);
    });
  })
  .catch((err) => {
    console.error('Error starting Next.js server:', err);
    try {
      fs.appendFileSync(
        path.join(__dirname, 'startup_error.log'),
        `[${new Date().toISOString()}] Startup error: ${err && err.stack ? err.stack : err}\n`
      );
    } catch (_) {}

    // Start a diagnostic recovery server so Passenger stays running
    // and Apache NEVER falls back to serving a raw directory listing.
    const recoveryServer = createServer((req, res) => {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>SDB AutoScan - Server Initializing</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b1329; color: #f8fafc; margin: 0; padding: 40px 16px; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { max-width: 620px; width: 100%; background: #131f37; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    h1 { color: #f59e0b; font-size: 22px; margin: 0 0 12px; display: flex; align-items: center; gap: 8px; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 8px 0; }
    pre { background: #070d1e; border: 1px solid rgba(239,68,68,0.25); color: #fca5a5; padding: 14px; border-radius: 8px; font-size: 13px; overflow-x: auto; white-space: pre-wrap; word-break: break-all; }
    .steps { background: rgba(0, 114, 188, 0.08); border-left: 3px solid #0072BC; padding: 12px 16px; border-radius: 4px; margin-top: 16px; }
    .steps li { margin: 6px 0; color: #cbd5e1; font-size: 13px; }
    code { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; color: #38bdf8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>⚠️ Application Initializing / Build Required</h1>
    <p>Next.js server could not start automatically. The error encountered was:</p>
    <pre>${err && err.message ? err.message : String(err)}</pre>
    <div class="steps">
      <p style="color:#38bdf8;font-weight:600;margin:0 0 6px;">How to resolve on cPanel:</p>
      <ol style="margin:0;padding-left:18px;">
        <li>Open <strong>Terminal</strong> in cPanel and navigate to this folder:
          <br><code>cd /home/slmalzxh/uat.loopsintegrated.co/sdb</code>
        </li>
        <li>Build the production package:
          <br><code>npm run build</code>
        </li>
        <li>In <strong>Setup Node.js App</strong>, click <strong>RESTART</strong>.</li>
      </ol>
    </div>
  </div>
</body>
</html>`);
    });

    recoveryServer.on('error', (servErr) => {
      console.error('Recovery server error:', servErr);
    });

    recoveryServer.listen(port, () => {
      console.log(`> Diagnostic recovery server listening on port: ${port}`);
    });
  });



