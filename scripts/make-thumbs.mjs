// Makes a cover picture (thumb.jpg) for every game that doesn't have one.
// It opens the game in a headless browser, taps its Play/Start button, waits a moment
// and takes a screenshot mid-game. A game's own thumb.png/jpg/webp/svg always wins.
//
// Run: node scripts/make-thumbs.mjs            (needs the "playwright" npm package + Chromium)
// Optional: CHROME_PATH=/path/to/chrome to use an already-installed browser.
// Optional: --force to redo pictures this script made before (it never replaces a hand-made one).

import { readdir, access, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GAMES = path.join(ROOT, 'games');
const FORCE = process.argv.includes('--force');
const exists = async (p) => { try { await access(p); return true; } catch { return false; } };
const MARK = '.thumb-auto';  // marks a thumb.jpg this script made, so --force can redo it safely

// tiny static server so games load exactly as they do on the site
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  let body;
  try { body = await readFile(file); } catch { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' }).end(body);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const todo = [];
for (const e of await readdir(GAMES, { withFileTypes: true })) {
  if (!e.isDirectory() || e.name.startsWith('_') || e.name.startsWith('.')) continue;
  const dir = path.join(GAMES, e.name);
  if (!(await exists(path.join(dir, 'index.html')))) continue;
  const auto = await exists(path.join(dir, MARK));
  const own = ['thumb.png', 'thumb.webp', 'thumb.svg'];
  let hasOwn = false;
  for (const f of own) if (await exists(path.join(dir, f))) hasOwn = true;
  if (await exists(path.join(dir, 'thumb.jpg')) && !auto) hasOwn = true;
  if (hasOwn) continue;
  if (auto && !FORCE) continue;
  todo.push(e.name);
}

if (!todo.length) { console.log('All games already have a picture.'); server.close(); process.exit(0); }

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const SKIP = /pause|mute|sound|⏸|▶|🔊|🔇|♪|🎵/i;
for (const slug of todo) {
  const page = await browser.newPage({ viewport: { width: 960, height: 600 } });
  try {
    await page.goto(`${base}/games/${slug}/`, { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(800);
    // tap the most "play-like" button, then up to one more big button (e.g. a menu choice)
    for (let round = 0; round < 2; round++) {
      const btns = page.locator('button:visible');
      const n = await btns.count();
      let best = null, bestScore = -1;
      for (let i = 0; i < n; i++) {
        const b = btns.nth(i);
        const label = ((await b.innerText().catch(() => '')) + ' ' + ((await b.getAttribute('aria-label')) || '')).trim();
        if (SKIP.test(label)) continue;
        const box = await b.boundingBox();
        if (!box) continue;
        const score = box.width * box.height + (/play|start|ride|go|begin|open|again/i.test(label) ? 1e6 : 0);
        if (score > bestScore) { bestScore = score; best = b; }
      }
      if (!best) break;
      await best.click({ timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(round === 0 ? 1500 : 2500);
    }
    // frame the game itself if it's a canvas narrower than the window (e.g. phone-shaped games)
    const clip = await page.evaluate(() => {
      const c = [...document.querySelectorAll('canvas')].map((el) => el.getBoundingClientRect())
        .sort((a, b) => b.width * b.height - a.width * a.height)[0];
      if (!c || c.width * c.height < innerWidth * innerHeight * 0.3) return null;
      return { x: Math.max(0, c.left), y: Math.max(0, c.top), width: Math.min(c.width, innerWidth), height: Math.min(c.height, innerHeight) };
    });
    const out = path.join(GAMES, slug, 'thumb.jpg');
    await page.screenshot({ path: out, type: 'jpeg', quality: 78, ...(clip ? { clip } : {}) });
    await writeFile(path.join(GAMES, slug, MARK), 'thumb.jpg was made automatically. Delete both files and add your own thumb.png to replace it.\n');
    console.log(`Picture made for ${slug}`);
  } catch (err) {
    console.log(`Could not make a picture for ${slug}: ${err.message}. It keeps the coloured letter tile.`);
  }
  await page.close();
}
await browser.close();
server.close();
