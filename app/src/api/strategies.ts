/**
 * Client-side API wrapper for the /api/strategies serverless function.
 * Reads password from sessionStorage and sends it as Authorization header.
 */

const BASE = '/api/strategies';

function authHeader(): Record<string, string> {
  const password = sessionStorage.getItem('site_password') ?? '';
  return { Authorization: `Bearer ${password}`, 'Content-Type': 'application/json' };
}

export async function apiListStrategies(): Promise<{ name: string }[]> {
  const res = await fetch(BASE, { headers: authHeader() });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error(`Error listing: ${res.status}`);
  return res.json();
}

export async function apiGetStrategy(name: string): Promise<unknown> {
  const res = await fetch(`${BASE}?name=${encodeURIComponent(name)}`, { headers: authHeader() });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error(`Error getting: ${res.status}`);
  return res.json();
}

export async function apiSaveStrategy(name: string, data: unknown): Promise<void> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ name, data }),
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error(`Error saving: ${res.status}`);
}

export async function apiDeleteStrategy(name: string): Promise<void> {
  const res = await fetch(`${BASE}?name=${encodeURIComponent(name)}`, {
    method: 'DELETE',
    headers: authHeader(),
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error(`Error deleting: ${res.status}`);
}
