/* Fetch the latin subsets of the three project faces once and store them in
   src/assets/fonts/, so the built masterclass has no runtime network call.
   Run only when the font set changes:  node fetch-fonts.mjs
   The build itself never touches the network. */
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'src/assets/fonts');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

/* Only the faces the masterclass actually uses (BUILD-BRIEF Phase 0.4). */
const FAMILIES = [
  'Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700',
  'IBM+Plex+Sans:wght@300;400;500;600;700',
  'IBM+Plex+Mono:wght@400;500;600'
];

const url = 'https://fonts.googleapis.com/css2?' +
  FAMILIES.map((f) => 'family=' + f).join('&') + '&display=swap';

const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();

const blocks = [];
const re = /\/\*\s*([a-z0-9-\[\]]+)\s*\*\/\s*@font-face\s*\{([^}]+)\}/gi;
let m;
while ((m = re.exec(css))) blocks.push({ subset: m[1], body: m[2] });

const keep = blocks.filter((b) => b.subset === 'latin');
if (!keep.length) { console.error('no latin subsets found — google served:\n' + css.slice(0, 400)); process.exit(1); }

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

/* Google serves one variable file for every weight of a variable family, so
   collapse identical payloads into a single face with a weight range. */
const seen = new Map();
for (const b of keep) {
  const get = (k) => (new RegExp(k + ':\\s*([^;]+);').exec(b.body) || [, ''])[1].trim();
  const family = get('font-family').replace(/['"]/g, '');
  const style = get('font-style') || 'normal';
  const weight = get('font-weight') || '400';
  const src = /url\(([^)]+)\)/.exec(get('src'));
  if (!src) continue;
  const bin = Buffer.from(await (await fetch(src[1])).arrayBuffer());
  const key = family + '|' + style + '|' + createHash('md5').update(bin).digest('hex');
  const lo = Number(weight.split(/\s+/)[0]), hi = Number(weight.split(/\s+/).pop());
  const hit = seen.get(key);
  if (hit) { hit.lo = Math.min(hit.lo, lo); hit.hi = Math.max(hit.hi, hi); continue; }
  seen.set(key, { family, style, lo, hi, bin });
}

const manifest = [];
let total = 0;
for (const f of seen.values()) {
  const name = (f.family + '-' + f.style + '-' + f.lo + '-' + f.hi).replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.woff2';
  await writeFile(join(OUT, name), f.bin);
  total += f.bin.length;
  manifest.push({ family: f.family, style: f.style, weight: f.lo === f.hi ? String(f.lo) : f.lo + ' ' + f.hi, file: name, bytes: f.bin.length });
  console.log(String(f.bin.length).padStart(8), name);
}

await writeFile(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('total', (total / 1024).toFixed(1), 'KB across', manifest.length, 'faces');
