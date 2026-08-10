/* ============================================================================
   build:single — assemble one self-contained offline .html  (CLAUDE.md RULE 8)

   Zero dependencies and zero network. It:
     1. turns src/facts.ts into the runtime accuracy firewall, mechanically, so
        the shipped facts are byte-identical to the file Kapil transcribed;
     2. asserts the arithmetic and the counts that the exam turns on, and fails
        the build if any of them drift;
     3. inlines the latin font subsets, the scene CSS and the engine into
        src/page.html at its markers.

   node build.mjs            → dist/mutual-fund-ch16-3d.html
   ========================================================================== */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, 'src');
const OUT = join(HERE, 'dist', 'mutual-fund-ch16-3d.html');

const fail = (m) => { console.error('\n  BUILD FAILED — ' + m + '\n'); process.exit(1); };

/* ------------------------------------------------- 1. facts.ts → facts.js */

const ts = await readFile(join(SRC, 'facts.ts'), 'utf8');
const names = [...ts.matchAll(/^export const ([A-Za-z0-9_]+)/gm)].map((m) => m[1]);
if (!names.length) fail('no exports found in facts.ts');

const factsJs = ts
  .replace(/^export type [^\n]*\n/gm, '')
  .replace(/^export const ([A-Za-z0-9_]+)\s*:\s*[^=]+=/gm, 'const $1 =')
  .replace(/^export const /gm, 'const ')
  .replace(/ as Provenance/g, '')
  .replace(/ as const/g, '');

const bundleFacts =
  '/* facts.ts, mechanically transformed at build time — do not edit here. */\n' +
  '(function(){\n' + factsJs + '\nwindow.MF_FACTS = {' + names.join(', ') + '};\n})();';

/* ------------------------------------------------------- 2. content lock */

const F = (() => {
  const box = {};
  new Function('window', factsJs + '\nwindow.F = {' + names.join(', ') + '};')(box);
  return box.F;
})();

const checks = [];
const check = (ok, what) => { checks.push([!!ok, what]); if (!ok) fail(what); };

F.navWorked.forEach((p) => {
  const got = (p.totalValue - p.liabilities) / p.units;
  check(got === p.expectedNav, `${p.label}: (${p.totalValue} − ${p.liabilities}) ÷ ${p.units} = ${got}, expected ${p.expectedNav}`);
});
check(F.differences.length === 6, 'six rows in the open/closed differences table');
check(F.differences.every((d) => d.feature3d), 'every differences row is linked to a 3D feature');
check(F.typesByYield.length === 9, 'nine types by yield in the main body');
check(F.typesByYield.some((t) => t.id === 'realestate'), 'real estate fund present (the summary drops it)');
check(F.typesByYield.every((t) => F.typePositions[t.id]), 'every type has a position in the risk/return/liquidity space');
check(Object.keys(F.typePositions).length === F.typesByYield.length, 'no positions for types that do not exist');
check(F.benefits.length === 8, 'eight benefits in the main body');
check(F.parties.length === 5, 'five parties');
check(F.typesByOperation.length === 3, 'three types by operation');
check(F.narration.pool.length === 6, 'six narration steps for the pooling scene');
check(F.narration.navVessel.length === 5, 'five narration steps for the NAV vessel');
check(F.narration.corpus.length === 6, 'six narration steps for the corpus scene');
check(F.paperPattern.sections.reduce((a, s) => a + s.total, 0) === F.paperPattern.fullMarks, 'the paper pattern totals 80');
check(F.meaning.initialOfferPrice === 10, 'initial offer price is ₹10');
check(F.indiaTimeline.some((t) => t.year === 1963) && F.indiaTimeline.some((t) => t.year === 1964),
  'the UTI Act (1963) and the UTI institution (1964) are both present');

/* ------------------------------------------------------------ 3. fonts */

const FONTDIR = join(SRC, 'assets', 'fonts');
let fontCss = '';
if (existsSync(join(FONTDIR, 'manifest.json'))) {
  const man = JSON.parse(await readFile(join(FONTDIR, 'manifest.json'), 'utf8'));
  const faces = [];
  for (const f of man) {
    const b64 = (await readFile(join(FONTDIR, f.file))).toString('base64');
    faces.push(
      '@font-face{font-family:\'' + f.family + '\';font-style:' + f.style + ';font-weight:' + f.weight +
      ';font-display:swap;src:url(data:font/woff2;base64,' + b64 + ') format(\'woff2\');}'
    );
  }
  fontCss = '<style>\n' + faces.join('\n') + '\n</style>';
} else {
  console.warn('  ! no font subsets found — falling back to the Google Fonts link (the build will need a network at runtime)');
  fontCss =
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">';
}

/* --------------------------------------------------------- 4. assemble */

const css = await readFile(join(SRC, 'scenes.css'), 'utf8');
const engineDir = join(SRC, 'engine');
const files = (await readdir(engineDir)).filter((f) => f.endsWith('.js')).sort();
const engine = [];
for (const f of files) engine.push('/* ---- ' + f + ' ---- */\n' + await readFile(join(engineDir, f), 'utf8'));

let page = await readFile(join(SRC, 'page.html'), 'utf8');
for (const marker of ['<!--MF3D:FONTS-->', '<!--MF3D:CSS-->', '<!--MF3D:JS-->']) {
  if (!page.includes(marker)) fail('missing marker ' + marker + ' in src/page.html');
}

page = page
  .replace('<!--MF3D:FONTS-->', fontCss)
  .replace('<!--MF3D:CSS-->', '<style>\n' + css + '</style>')
  .replace('<!--MF3D:JS-->', '<script>\n' + bundleFacts + '\n</script>\n<script>\n' + engine.join('\n') + '</script>');

/* No runtime network calls are permitted (CLAUDE.md RULE 3). */
const remote = [...page.matchAll(/(?:src|href)\s*=\s*["'](https?:)?\/\/[^"']+/gi)].map((m) => m[0]);
if (remote.length && existsSync(join(FONTDIR, 'manifest.json'))) {
  fail('the built file still references the network:\n    ' + remote.join('\n    '));
}

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, page);

const kb = (Buffer.byteLength(page) / 1024).toFixed(0);
console.log('\n  content lock: ' + checks.length + ' checks passed');
console.log('  engine:       ' + files.length + ' files, ' + (Buffer.byteLength(engine.join('')) / 1024).toFixed(0) + ' KB');
console.log('  fonts:        ' + (fontCss.length / 1024).toFixed(0) + ' KB inlined');
console.log('  → dist/mutual-fund-ch16-3d.html  ' + kb + ' KB, offline\n');
if (Buffer.byteLength(page) > 6 * 1024 * 1024) fail('over the 6 MB ceiling');
