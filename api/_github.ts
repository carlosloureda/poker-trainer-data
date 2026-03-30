/**
 * Shared GitHub API utility for serverless functions.
 * Uses GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO env vars.
 * Strategies are stored as JSON files in the `strategies/` folder of the repo.
 */

const BASE_URL = 'https://api.github.com';

function headers() {
  return {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}

function repoPath(filename?: string) {
  const base = `${BASE_URL}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/strategies`;
  return filename ? `${base}/${filename}.json` : base;
}

export interface GithubFile {
  name: string;
  sha: string;
  download_url: string;
}

/** List all strategy files in the repo */
export async function listStrategies(): Promise<{ name: string }[]> {
  const res = await fetch(repoPath(), { headers: headers() });
  if (res.status === 404) return []; // folder doesn't exist yet
  if (!res.ok) throw new Error(`GitHub list error: ${res.status}`);
  const files: GithubFile[] = await res.json();
  return files
    .filter((f) => f.name.endsWith('.json'))
    .map((f) => ({ name: f.name.replace('.json', '') }));
}

/** Get the content of a strategy file */
export async function getStrategy(name: string): Promise<{ data: unknown; sha: string } | null> {
  const res = await fetch(repoPath(name), { headers: headers() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub get error: ${res.status}`);
  const file = await res.json();
  const decoded = JSON.parse(Buffer.from(file.content, 'base64').toString('utf-8'));
  return { data: decoded, sha: file.sha };
}

/** Create or update a strategy file */
export async function saveStrategy(name: string, data: unknown): Promise<void> {
  // Get current SHA if file exists (needed for updates)
  const existing = await getStrategy(name);
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

  const body: Record<string, string> = {
    message: `update strategy: ${name}`,
    content,
  };
  if (existing) body.sha = existing.sha;

  const res = await fetch(repoPath(name), {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub save error: ${res.status}`);
}

/** Delete a strategy file */
export async function deleteStrategy(name: string): Promise<void> {
  const existing = await getStrategy(name);
  if (!existing) return;

  const res = await fetch(repoPath(name), {
    method: 'DELETE',
    headers: headers(),
    body: JSON.stringify({ message: `delete strategy: ${name}`, sha: existing.sha }),
  });
  if (!res.ok) throw new Error(`GitHub delete error: ${res.status}`);
}
