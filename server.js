// CommonJS on purpose: CloudLinux Passenger loads the startup file with require()
const { createServer } = require('http');
const fs = require('fs');
const path = require('path');
const next = require('next');

// Phusion Passenger passes process.env.PORT which may be a numeric port, a unix socket path, or 'passenger'
const rawPort = process.env.PORT;
const port = rawPort && !isNaN(Number(rawPort)) ? parseInt(rawPort, 10) : (rawPort || 3000);

// Ensure Next.js always runs in production mode and resolves .next relative to server.js directory
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
        await handle(req, res);
      } catch (err) {
        console.error('Error handling request:', req.url, err);
        res.statusCode = 500;
        res.end('Internal Server Error');
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

