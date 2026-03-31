import http from 'http';
import { pathToFileURL } from 'url';
import path from 'path';
import dotenv from 'dotenv';

// Load .env from root
dotenv.config({ path: path.join(process.cwd(), '.env') });

const PORT = 3001;

/**
 * Simple local server to emulate Vercel's serverless functions locally
 * without needing the vercel-cli.
 */
const server = http.createServer(async (req, res) => {
  // Simple CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.writeHead(200).end();

  try {
    // Route /strategies to our api/strategies.ts
    if (req.url?.startsWith('/strategies')) {
      const { default: handler } = await import('./strategies.ts');
      
      // Minimal req/res mocks for Vercel's Handler types
      const vercelReq = Object.assign(req, {
        query: Object.fromEntries(new URL(req.url, `http://localhost:${PORT}`).searchParams),
        body: await new Promise((resolve) => {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => resolve(body ? JSON.parse(body) : {}));
        })
      });

      const vercelRes = Object.assign(res, {
        status: (code: number) => { res.statusCode = code; return vercelRes; },
        json: (data: unknown) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return vercelRes;
        }
      });

      await handler(vercelReq as any, vercelRes as any);
    } else {
      res.writeHead(404).end('Not found');
    }
  } catch (err) {
    console.error(err);
    res.writeHead(500).end(String(err));
  }
});

server.listen(PORT, () => {
  console.log(`Local API emulator running on http://localhost:${PORT}`);
});
