import { createServer } from 'http';
import next from 'next';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
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
