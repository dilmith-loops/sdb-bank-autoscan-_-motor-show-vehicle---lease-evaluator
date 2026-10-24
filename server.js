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
    createServer(async (req, res) => {
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
    }).listen(port, () => {
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
    process.exit(1);
  });


