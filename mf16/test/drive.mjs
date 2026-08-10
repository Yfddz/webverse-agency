/* ============================================================================
   Drive the built masterclass in a real browser and report what actually
   happened (CLAUDE.md RULE 10 — "should work" is not a test result).

   node test/drive.mjs [--shots <dir>] [--headed]
   Needs playwright available on NODE_PATH; it is a dev-time check only and is
   never part of the shipped artifact.
   ========================================================================== */
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';

const HERE = dirname(fileURLToPath(import.meta.url));
const FILE = pathToFileURL(join(HERE, '..', 'dist', 'mutual-fund-ch16-3d.html')).href;
const SHOTS = (() => {
  const i = process.argv.indexOf('--shots');
  return i > 0 ? process.argv[i + 1] : null;
})();

const results = [];

/* The page sets scroll-behavior: smooth, so every scroll here is forced
   instant — otherwise the assertions race the animation. */
async function scrollTo(page, sel, offset = -160) {
  await page.evaluate(([s, o]) => {
    const el = document.querySelector(s);
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + o, behavior: 'instant' });
  }, [sel, offset]);
  await page.waitForTimeout(700);
}
function ok(name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
  console.log((pass ? '  PASS  ' : '  FAIL  ') + name + (detail !== undefined ? '   ' + detail : ''));
}

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--use-gl=angle', '--ignore-gpu-blocklist']
});

async function open(opts = {}) {
  const ctx = await browser.newContext({
    viewport: opts.viewport || { width: 1280, height: 900 },
    deviceScaleFactor: opts.dsf || 1,
    reducedMotion: opts.reducedMotion || 'no-preference'
  });
  const page = await ctx.newPage();
  const errors = [];
  const requests = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('request', (r) => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:')) requests.push(r.url()); });
  await page.goto(FILE + (opts.query || ''), { waitUntil: 'load' });
  await page.waitForTimeout(700);
  return { ctx, page, errors, requests };
}

/* -------------------------------------------------------- 1. desktop, 3D on */

{
  const { ctx, page, errors, requests } = await open({ query: '?3d=on' });

  ok('no network requests at runtime', requests.length === 0, requests.join(', '));

  const scenes = await page.$$eval('.s3d', (n) => n.map((s) => s.id));
  ok('four scenes mounted into the page', scenes.length === 4, scenes.join(', '));

  const atLoad = await page.evaluate(() =>
    window.MF3D.scenes.map((s) => ({ id: s.id, mounted: s.mounted, top: Math.round(s.root.getBoundingClientRect().top) })));
  ok('nothing mounts on load — every scene is more than a viewport below the fold',
    atLoad.every((s) => !s.mounted), JSON.stringify(atLoad));

  await scrollTo(page, '#s3d-pool');
  const live = await page.evaluate(() =>
    window.MF3D.scenes.map((s) => ({ id: s.id, lite: !s.use3d(), mounted: s.mounted, dead: s.dead, why: s.deadReason })));
  ok('3D actually running, nothing silently degraded',
    live.every((s) => !s.dead), JSON.stringify(live.filter((s) => s.dead)));
  ok('scene A mounts when scrolled into range', live[0].mounted);
  ok('scene D still not mounted, far below', !live[3].mounted);

  /* WebGL is genuinely drawing, not a blank canvas. The read has to happen in
     the same task as the draw — the drawing buffer is cleared on composite. */
  const drawn = await page.evaluate(() => {
    const s = window.MF3D.scenes[0];
    if (!s.mounted) return { err: 'not mounted' };
    s.goto(4);
    for (let k = 0; k < 40; k++) s.tick(1 / 30);
    const gl = s.rd.gl, c = s.canvas;
    const px = new Uint8Array(4 * c.width * c.height);
    gl.readPixels(0, 0, c.width, c.height, gl.RGBA, gl.UNSIGNED_BYTE, px);
    let lit = 0, gold = 0;
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3] > 8) lit++;
      if (px[i] > px[i + 2] + 20) gold++;
    }
    s.goto(0);
    return { lit, gold, total: c.width * c.height, webgl2: s.rd.v2, labels: s.labelLayer.children.length };
  });
  ok('scene A draws real geometry (lit pixels, warm palette, live labels)',
    drawn.lit > 2000 && drawn.gold > 500 && drawn.labels > 5, JSON.stringify(drawn));

  /* Step machine + narration wiring (no speech voices in headless, so the
     watchdog path is the one under test here). */
  await page.click('#s3d-pool .s3d-next');
  await page.click('#s3d-pool .s3d-next');
  const counter = await page.textContent('#s3d-pool .s3d-step');
  ok('stepping forward advances the counter', counter.trim() === '3 / 6', counter.trim());
  await page.click('#s3d-pool .s3d-restart');
  ok('restart returns to step 1', (await page.textContent('#s3d-pool .s3d-step')).trim() === '1 / 6');

  const played = await page.evaluate(async () => {
    const s = window.MF3D.scenes[0];
    s.play();
    const was = s.playing;
    await new Promise((r) => setTimeout(r, 1200));
    const moved = s.idx > 0 || s.stepT > 0;
    s.pause();
    return { was, moved, idx: s.idx };
  });
  ok('play advances the scene with no speech voice installed', played.was && played.moved, JSON.stringify(played));

  /* --- Scene B arithmetic, the acceptance criterion that carries marks --- */
  const nav = await page.evaluate(() => {
    const presets = window.MF_FACTS.navWorked;
    const scene = window.MF3D.scenes[1];
    const out = [];
    for (const p of presets) {
      scene.state.total = p.totalValue; scene.state.liab = p.liabilities; scene.state.units = p.units;
      scene.refreshAll();
      const txt = document.querySelector('#s3d-nav .nav-out .big').textContent;
      out.push({ label: p.label, txt, expect: p.expectedNav });
    }
    return out;
  });
  nav.forEach((r) => ok('preset ' + r.label + ' reads ₹' + r.expect.toFixed(2),
    r.txt.includes('₹' + r.expect.toFixed(2)), r.txt));

  const sweep = await page.evaluate(() => {
    const s = window.MF3D.scenes[1], bad = [];
    for (let i = 0; i < 40; i++) {
      const total = 100000 + i * 1731000, liab = i * 37000, units = 10000 + i * 61000;
      s.state.total = total; s.state.liab = liab; s.state.units = units;
      s.refreshAll();
      const shown = document.querySelector('#s3d-nav .nav-out .big').textContent.replace(/[^0-9.\-]/g, '');
      const want = ((total - liab) / units).toFixed(2);
      if (shown !== want) bad.push({ total, liab, units, shown, want });
    }
    return bad;
  });
  ok('NAV readout matches (T − L) ÷ U to 2dp across 40 slider positions', sweep.length === 0, JSON.stringify(sweep.slice(0, 3)));

  const wrong = await page.evaluate(() => {
    const s = window.MF3D.scenes[1];
    s.state.total = 5200000; s.state.liab = 200000; s.state.units = 500000; s.state.wrong = true;
    s.refreshAll();
    const el = document.querySelector('#s3d-nav .nav-out');
    const t = el.textContent;
    s.state.wrong = false; s.refreshAll();
    return { t, flagged: el.className };
  });
  ok('wrong-order toggle shows 10.40 then the absurd result, marked as an error',
    wrong.t.includes('10.40') && wrong.t.includes('This is not a price') && wrong.t.includes('₹10.00'), wrong.t.slice(0, 120));

  /* --- Scene C bidirectional linking --- */
  const linked = await page.evaluate(() => {
    const s = window.MF3D.scenes[2];
    const rows = [...document.querySelectorAll('#s3d-corpus .c-row')];
    const out = { rows: rows.length, both: true, features: [] };
    for (const r of rows) {
      r.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
      out.features.push(s.state.hi);
      if (s.state.hi !== r.dataset.feature) out.both = false;
      r.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
    }
    /* now the other direction: set the feature, the row must light up */
    s.state.hi = 'exchange-door'; s.refreshAll();
    const lit = document.querySelector('#s3d-corpus .c-row[data-feature="exchange-door"]').classList.contains('hi');
    s.state.hi = null; s.refreshAll();
    return Object.assign(out, { lit });
  });
  ok('all six differences rows drive the scene', linked.rows === 6 && linked.both, linked.features.join(', '));
  ok('a selected 3D feature lights its table row', linked.lit);

  const scrub = await page.evaluate(() => {
    const s = window.MF3D.scenes[2], seen = [];
    for (const t of [0.05, 0.5, 1]) {
      s.state.time = t; s.refreshAll();
      seen.push(document.querySelector('#s3d-corpus .c-chips').textContent.replace(/\s+/g, ' '));
    }
    return seen;
  });
  ok('the scrubber changes the can-buy / can-sell verdicts', new Set(scrub).size === 3,
    'offer / mid-life / maturity all differ: ' + (new Set(scrub).size === 3));

  /* --- Scene D --- */
  await scrollTo(page, '#s3d-space');
  const d = await page.evaluate(() => {
    const s = window.MF3D.scenes[3];
    s.state.sel = 'realestate'; s.refreshAll();
    const txt = document.querySelector('#s3d-space .d-verb').textContent;
    const book = window.MF_FACTS.typesByYield.find((t) => t.id === 'realestate').text;
    const chips = document.querySelectorAll('#s3d-space .mf-chip').length;
    s.state.quiz = true; s.state.answers = { stock: 'stock', leverage: 'growth' }; s.refreshAll();
    const score = document.querySelector('#s3d-space .d-score').textContent;
    s.state.quiz = false; s.state.answers = {}; s.state.sel = null; s.refreshAll();
    return { verbatim: txt.trim() === book.trim(), chips, score, spheres: 9 };
  });
  ok('scene D shows the verbatim textbook definition', d.verbatim);
  ok('scene D carries the illustrative disclaimer chip', d.chips >= 1, d.chips);
  ok('scene D quiz scores placements', /2 of 9 placed/.test(d.score) && /1 correct/.test(d.score), d.score.trim());

  /* --- unmount when two viewports away (renderer.info equivalent) --- */
  await scrollTo(page, '#s3d-pool');
  const before = await page.evaluate(() => {
    const s = window.MF3D.scenes[0];
    return { mounted: s.mounted, meshes: s.rd ? s.rd.meshes.length : 0, labels: s.labelLayer.children.length };
  });
  await scrollTo(page, '#part-10');
  const after = await page.evaluate(() => {
    const s = window.MF3D.scenes[0];
    return { mounted: s.mounted, rd: !!s.rd, impl: !!s.impl, labels: s.labelLayer.children.length, active: !!s.rd };
  });
  await scrollTo(page, '#s3d-pool');
  const back = await page.evaluate(() => {
    const s = window.MF3D.scenes[0];
    return { mounted: s.mounted, meshes: s.rd ? s.rd.meshes.length : 0 };
  });
  ok('a scene builds GL resources when in range', before.mounted && before.meshes > 0 && before.labels > 0, JSON.stringify(before));
  ok('and frees them all when scrolled two viewports away',
    !after.mounted && !after.rd && !after.impl && after.labels === 0, JSON.stringify(after));
  ok('and rebuilds cleanly on return', back.mounted && back.meshes > 0, JSON.stringify(back));

  /* Repeated mount/unmount churn must not accumulate dead GL contexts. */
  const churn = await page.evaluate(async () => {
    const s = window.MF3D.scenes[0];
    const log = [];
    for (let i = 0; i < 6; i++) {
      s.unmount();
      s.nearby = true;
      s.mount();
      log.push({ mounted: s.mounted, dead: s.dead, why: s.deadReason });
    }
    return log;
  });
  ok('six mount/unmount cycles all rebuild a working context',
    churn.every((c) => c.mounted && !c.dead), JSON.stringify(churn.filter((c) => !c.mounted || c.dead)));

  /* --- legacy features still alive --- */
  const legacy = await page.evaluate(() => ({
    quiz: document.querySelectorAll('#quiz .q').length,
    flips: document.querySelectorAll('#flipGrid .flip').length,
    players: document.querySelectorAll('.vplayer').length,
    listen: document.querySelectorAll('.listen-btn').length,
    complete: document.querySelectorAll('.complete-btn').length,
    figures: document.querySelectorAll('.figure').length,
    sort: document.querySelectorAll('#sortDrill .q').length,
    benefits: document.querySelectorAll('#benefitCheck .reveal').length
  }));
  ok('legacy features intact (quiz 12, flip cards 9, explainers 3, listen 10, complete 10, figures 6, drill 8, benefits 8)',
    legacy.quiz === 12 && legacy.flips === 9 && legacy.players === 3 && legacy.listen === 10 &&
    legacy.complete === 10 && legacy.figures === 6 && legacy.sort === 8 && legacy.benefits === 8,
    JSON.stringify(legacy));

  const calcNav = await page.evaluate(() => {
    document.getElementById('navAssets').value = '5200000';
    document.getElementById('navLiab').value = '200000';
    document.getElementById('navUnits').value = '500000';
    document.getElementById('navAssets').dispatchEvent(new Event('input'));
    return document.getElementById('navOut').textContent;
  });
  ok('the original NAV calculator still computes', calcNav.includes('₹10.00'), calcNav.slice(-30));

  /* --- Phase 8: keyboard, prose, print --- */
  await scrollTo(page, '#s3d-pool');
  await page.focus('#s3d-pool');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  const kbStep = (await page.textContent('#s3d-pool .s3d-step')).trim();
  await page.keyboard.press('Space');
  const kbPlaying = await page.evaluate(() => window.MF3D.scenes[0].playing);
  await page.keyboard.press('Space');
  ok('arrow keys step and Space plays the focused scene', kbStep === '3 / 6' && kbPlaying, kbStep);

  await page.evaluate(() => document.body.click());
  await page.keyboard.press('l');
  const kbLite = await page.evaluate(() => window.MF3D.isLite());
  await page.keyboard.press('l');
  ok('L toggles Lite mode from anywhere', kbLite);

  const prose = await page.evaluate(() =>
    window.MF3D.scenes.map((s) => ({
      id: s.id,
      steps: s.def.steps.length,
      items: s.root.querySelectorAll('.s3d-prose li').length,
      aria: s.root.getAttribute('aria-label') ? 1 : 0,
      live: s.root.querySelector('[aria-live]') ? 1 : 0
    })));
  ok('every scene exposes its narration as readable prose, with aria',
    prose.every((p) => p.items === p.steps && p.aria && p.live), JSON.stringify(prose));

  await page.emulateMedia({ media: 'print' });
  const printed = await page.evaluate(() => {
    const s = document.querySelector('#s3d-pool');
    return {
      stage: getComputedStyle(s.querySelector('.s3d-stage')).display,
      flat: getComputedStyle(s.querySelector('.s3d-flat')).display,
      controls: getComputedStyle(s.querySelector('.s3d-controls')).display
    };
  });
  await page.emulateMedia({ media: 'screen' });
  ok('printing swaps every scene for its flat diagram and drops the controls',
    printed.stage === 'none' && printed.flat === 'block' && printed.controls === 'none', JSON.stringify(printed));

  /* --- the contents column can be closed and stays closed --- */
  const contents = await page.evaluate(async () => {
    const layout = document.querySelector('.layout');
    const sidebar = document.getElementById('sidebar');
    const open = { cols: getComputedStyle(layout).gridTemplateColumns, vis: sidebar.offsetWidth > 0 };
    document.getElementById('navClose').click();
    await new Promise((r) => setTimeout(r, 60));
    const closed = {
      cols: getComputedStyle(layout).gridTemplateColumns,
      vis: sidebar.offsetWidth > 0,
      stored: localStorage.getItem('mf16.nav'),
      expanded: document.getElementById('sidebarToggle').getAttribute('aria-expanded')
    };
    document.getElementById('sidebarToggle').click();
    await new Promise((r) => setTimeout(r, 60));
    const reopened = { vis: sidebar.offsetWidth > 0, stored: localStorage.getItem('mf16.nav') };
    return { open, closed, reopened };
  });
  ok('the contents column closes, frees its column and remembers it',
    contents.open.vis && !contents.closed.vis && contents.closed.stored === 'closed' &&
    contents.closed.expanded === 'false' && contents.closed.cols !== contents.open.cols, JSON.stringify(contents));
  ok('and the ☰ control brings it back',
    contents.reopened.vis && contents.reopened.stored === 'open', JSON.stringify(contents.reopened));

  ok('no console errors on the desktop pass', errors.length === 0, errors.slice(0, 3).join(' | '));

  if (SHOTS) {
    await mkdir(SHOTS, { recursive: true });
    for (const id of ['pool', 'nav', 'corpus', 'space']) {
      await scrollTo(page, '#s3d-' + id);
      await page.evaluate((i) => {
        const s = window.MF3D.scenes.find((x) => x.id === i);
        s.mount(); s.goto(s.def.steps.length - 1);
        for (let k = 0; k < 90; k++) s.tick(1 / 30);
      }, id);
      await page.waitForTimeout(500);
      const el = await page.$('#s3d-' + id);
      await el.screenshot({ path: join(SHOTS, 'scene-' + id + '.png') });
    }
  }
  await ctx.close();
}

/* --------------------------------------------------- 2. mobile, 390 px wide */

{
  const { ctx, page, errors } = await open({ viewport: { width: 390, height: 780 }, dsf: 3, query: '?3d=on' });
  const wide = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth
  }));
  const drawer = await page.evaluate(async () => {
    /* A column closed on a desktop must not disable the mobile drawer. */
    document.documentElement.classList.add('nav-closed');
    const sidebar = document.getElementById('sidebar');
    document.getElementById('sidebarToggle').click();
    await new Promise((r) => setTimeout(r, 60));
    const opened = sidebar.classList.contains('open') && sidebar.offsetWidth > 0;
    document.getElementById('navClose').click();
    await new Promise((r) => setTimeout(r, 60));
    return { opened, closed: !sidebar.classList.contains('open') };
  });
  ok('the mobile drawer still opens and closes, even with the desktop column collapsed',
    drawer.opened && drawer.closed, JSON.stringify(drawer));
  ok('no horizontal overflow at 390px', wide.scroll === wide.client, JSON.stringify(wide));

  await scrollTo(page, '#s3d-pool');
  const dpr = await page.evaluate(() => {
    const s = window.MF3D.scenes[0];
    return { dpr: s.rd.dpr, device: window.devicePixelRatio };
  });
  ok('device pixel ratio capped at 1.5 on mobile', dpr.dpr <= 1.5, JSON.stringify(dpr));

  /* Frame budget on a 4x-throttled CPU, which is the mid-tier Android proxy. */
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const fps = await page.evaluate(async () => {
    const s = window.MF3D.scenes[0];
    s.onScreen = true; s.hot = true;
    await new Promise((r) => setTimeout(r, 400));
    let n = 0;
    const t0 = performance.now();
    while (performance.now() - t0 < 2500) { s.tick(1 / 60); n++; await new Promise(requestAnimationFrame); }
    return { fps: (n / ((performance.now() - t0) / 1000)) };
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  ok('holds 30fps at 390px on a 4x-throttled CPU (software GL)', fps.fps >= 30, fps.fps.toFixed(1) + ' fps');
  ok('no console errors on the mobile pass', errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();
}

/* ------------------------------------------------------- 3. Lite behaviour */

{
  const { ctx, page, errors } = await open({ query: '?3d=off' });
  const lite = await page.evaluate(() => ({
    lite: window.MF3D.isLite(),
    flats: [...document.querySelectorAll('.s3d-flat')].filter((n) => n.offsetHeight > 0).length,
    canvases: [...document.querySelectorAll('.s3d-stage')].filter((n) => n.offsetHeight > 0).length,
    gl: window.MF3D.scenes.filter((s) => s.mounted).length
  }));
  ok('Lite mode shows every flat view and no canvas', lite.lite && lite.flats === 4 && lite.canvases === 0 && lite.gl === 0, JSON.stringify(lite));

  const liteNav = await page.evaluate(() => {
    const s = window.MF3D.scenes[1];
    s.state.total = 9600000; s.state.liab = 600000; s.state.units = 600000;
    s.refreshAll();
    return document.querySelector('#s3d-nav .nav-out .big').textContent;
  });
  ok('Lite keeps the NAV sliders and arithmetic working', liteNav.includes('₹15.00'), liteNav);

  const liteLink = await page.evaluate(() => {
    const s = window.MF3D.scenes[2];
    s.state.hi = 'exchange-door'; s.refreshAll();
    const n = document.querySelectorAll('#s3d-corpus .s3d-flat .hi').length;
    s.state.hi = null; s.refreshAll();
    return n;
  });
  ok('Lite keeps the table ↔ diagram linking', liteLink > 0, liteLink);

  await scrollTo(page, '#s3d-pool');
  const toggled = await page.evaluate(async () => {
    window.MF3D.setLite(false);
    await new Promise((r) => setTimeout(r, 600));
    const on = window.MF3D.scenes[0].mounted;
    const stage = getComputedStyle(document.querySelector('#s3d-pool .s3d-stage')).display;
    const stored = localStorage.getItem('mf16.lite');
    window.MF3D.setLite(true);
    const backToFlat = getComputedStyle(document.querySelector('#s3d-pool .s3d-stage')).display;
    return { on, stored, stage, backToFlat };
  });
  ok('the header toggle switches every scene at once and persists',
    toggled.on && toggled.stored === '0' && toggled.stage !== 'none' && toggled.backToFlat === 'none', JSON.stringify(toggled));
  ok('no console errors in Lite', errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();
}

/* -------------------------------------- 4. reduced motion falls back to Lite */

{
  const { ctx, page } = await open({ reducedMotion: 'reduce' });
  const auto = await page.evaluate(() => ({ lite: window.MF3D.isLite(), reduced: window.MF3D.reduced }));
  ok('prefers-reduced-motion auto-selects Lite without asking', auto.lite && auto.reduced, JSON.stringify(auto));
  await ctx.close();
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log('\n  ' + (results.length - failed.length) + '/' + results.length + ' checks passed\n');
process.exit(failed.length ? 1 : 0);
