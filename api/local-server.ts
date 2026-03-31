import http from 'http';
import path from 'path';
import fs from 'fs/promises';
import dotenv from 'dotenv';

// Load .env if exists (for testing other things), but we won't need GitHub token for disk
dotenv.config({ path: path.join(process.cwd(), '.env') });

const PORT = 3001;
const STRATEGIES_DIR = path.join(process.cwd(), 'strategies');

/**
 * Local server to handle strategies via local file system on dev mode.
 */
const server = http.createServer(async (req, res) => {
  // Simple CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.writeHead(200).end();

  // Ensure strategies directory exists
  await fs.mkdir(STRATEGIES_DIR, { recursive: true });

  const url = new URL(req.url || '', `http://localhost:${PORT}`);
  const strategyName = url.searchParams.get('name');

  try {
    if (url.pathname.startsWith('/strategies')) {
      switch (req.method) {
        case 'GET': {
          if (strategyName) {
            // Read single file
            const filePath = path.join(STRATEGIES_DIR, `${strategyName}.json`);
            try {
              const content = await fs.readFile(filePath, 'utf-8');
              return res.writeHead(200, { 'Content-Type': 'application/json' }).end(content);
            } catch {
              return res.writeHead(404).end(JSON.stringify({ error: 'Nnot found' }));
            }
          }
          // List files
          const files = await fs.readdir(STRATEGIES_DIR);
          const list = files
            .filter(f => f.endsWith('.json'))
            .map(f => ({ name: f.replace('.json', '') }));
          return res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(list));
        }

        case 'POST': {
          // Read body
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            const { name, data } = JSON.parse(body);
            if (!name || !data) return res.writeHead(400).end('name and data required');
            const filePath = path.join(STRATEGIES_DIR, `${name}.json`);
            await fs.writeFile(filePath, JSON.stringify(data, null, 2));
            res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ ok: true }));
          });
          break;
        }

        case 'PUT': {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            try {
              const { name, newName } = JSON.parse(body);
              if (!name || !newName) return res.writeHead(400).end('name and newName required');
              const oldPath = path.join(STRATEGIES_DIR, `${name}.json`);
              const newPath = path.join(STRATEGIES_DIR, `${newName}.json`);
              await fs.rename(oldPath, newPath);
              res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ ok: true }));
            } catch (e) {
              res.writeHead(500).end(String(e));
            }
          });
          break;
        }

        case 'DELETE': {
          if (!strategyName) return res.writeHead(400).end('name required');
          const filePath = path.join(STRATEGIES_DIR, `${strategyName}.json`);
          try {
            await fs.unlink(filePath);
            res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ ok: true }));
          } catch {
            res.writeHead(404).end('Not found');
          }
          break;
        }

        default:
          res.writeHead(405).end('Method not allowed');
      }
    } else {
      res.writeHead(404).end('Not found');
    }
  } catch (err) {
    console.error(err);
    res.writeHead(500).end(String(err));
  }
});

server.listen(PORT, () => {
  console.log(`Local OFFLINE API running at http://127.0.0.1:${PORT}`);
  console.log(`Working directory: ${STRATEGIES_DIR}`);
});
