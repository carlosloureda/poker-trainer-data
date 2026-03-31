import type { VercelRequest, VercelResponse } from '@vercel/node';
import { listStrategies, getStrategy, saveStrategy, deleteStrategy } from './_github';

/** Check the Authorization header matches SITE_PASSWORD or skip in local dev */
function isAuthorized(req: VercelRequest): boolean {
  if (process.env.NODE_ENV === 'development') return true;
  const auth = req.headers['authorization'] ?? '';
  return auth === `Bearer ${process.env.SITE_PASSWORD}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const { name } = req.query;
        if (name && typeof name === 'string') {
          // Get single strategy
          const result = await getStrategy(name);
          if (!result) return res.status(404).json({ error: 'Not found' });
          return res.status(200).json(result.data);
        }
        // List all
        const list = await listStrategies();
        return res.status(200).json(list);
      }

      case 'POST': {
        const { name, data } = req.body;
        if (!name || !data) return res.status(400).json({ error: 'name and data required' });
        await saveStrategy(name, data);
        return res.status(200).json({ ok: true });
      }

      case 'DELETE': {
        const { name } = req.query;
        if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name required' });
        await deleteStrategy(name);
        return res.status(200).json({ ok: true });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
}
