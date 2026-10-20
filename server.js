import { createServer } from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import next from 'next';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = parseInt(process.env.PORT || '3000', 10);
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
      console.log(`> SDB AutoScan production server ready on port ${port}`);
      console.log(`> Accessible under base path: /sdb`);
    });
  })
  .catch((err) => {
    console.error('Error starting Next.js server:', err);
    process.exit(1);
  });
