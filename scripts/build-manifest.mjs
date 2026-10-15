// Builds games.json from every folder in /games.
// Run: node scripts/build-manifest.mjs   (Node 18+, no dependencies)
// Folders starting with "_" or "." are ignored (e.g. games/_template).
// A broken game is skipped with a warning; it never blocks the others.

import { readdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GAMES_DIR = path.join(ROOT, 'games');
const REQUIRED = ['title', 'creator', 'description', 'added'];
const THUMB_CANDIDATES = ['thumb.png', 'thumb.jpg', 'thumb.webp', 'thumb.svg'];

const exists = async (p) => { try { await access(p); return true; } catch { return false; } };
const warn = (msg) => console.log(process.env.GITHUB_ACTIONS ? `::warning::${msg}` : `WARNING: ${msg}`);

const games = [];
const entries = await readdir(GAMES_DIR, { withFileTypes: true });

for (const entry of entries) {
  const slug = entry.name;
  if (!entry.isDirectory() || slug.startsWith('_') || slug.startsWith('.')) continue;
  const dir = path.join(GAMES_DIR, slug);

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) { warn(`${slug}: folder name must be lowercase-with-hyphens. Skipped.`); continue; }
  if (!(await exists(path.join(dir, 'index.html')))) { warn(`${slug}: missing index.html. Skipped.`); continue; }

  let meta;
  try { meta = JSON.parse(await readFile(path.join(dir, 'game.json'), 'utf8')); }
  catch (err) { warn(`${slug}: game.json missing or invalid (${err.message}). Skipped.`); continue; }

  const missing = REQUIRED.filter((k) => !meta[k]);
  if (missing.length) { warn(`${slug}: game.json missing ${missing.join(', ')}. Skipped.`); continue; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.added)) { warn(`${slug}: "added" must be YYYY-MM-DD. Skipped.`); continue; }
  if (meta.status === 'hidden') continue;

  let thumbnail = null;
  for (const f of [meta.thumbnail, ...THUMB_CANDIDATES].filter(Boolean)) {
    if (await exists(path.join(dir, f))) { thumbnail = `games/${slug}/${f}`; break; }
  }

  games.push({
    slug,
    title: String(meta.title),
    creator: String(meta.creator),
    description: String(meta.description),
    controls: meta.controls ? String(meta.controls) : '',
    tags: Array.isArray(meta.tags) ? meta.tags.map(String) : [],
    orientation: meta.orientation || 'any',
    added: meta.added,
    thumbnail,
    url: `games/${slug}/`,
  });
}

games.sort((a, b) => b.added.localeCompare(a.added) || a.title.localeCompare(b.title));

await writeFile(path.join(ROOT, 'games.json'), JSON.stringify({ count: games.length, games }, null, 2) + '\n');
console.log(`games.json written with ${games.length} game(s).`);
