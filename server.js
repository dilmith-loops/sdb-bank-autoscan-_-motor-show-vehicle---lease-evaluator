// CommonJS on purpose: CloudLinux Passenger loads the startup file with require()
const { createServer } = require('http');
const fs = require('fs');
const path = require('path');
const next = require('next');

// Explicitly load .env and .env.production from __dirname for Passenger
try {
  const { loadEnvConfig } = require('@next/env');
  loadEnvConfig(__dirname);
} catch (e) {
  console.warn('Could not load @next/env:', e.message);
}

// Phusion Passenger passes process.env.PORT which may be a numeric port, a unix socket path, or 'passenger'
const rawPort = process.env.PORT;
const port = rawPort && !isNaN(Number(rawPort)) ? parseInt(rawPort, 10) : (rawPort || 3000);

const { parse } = require('url');

// Ensure Next.js always runs in production mode and resolves .next relative to server.js directory
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
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

