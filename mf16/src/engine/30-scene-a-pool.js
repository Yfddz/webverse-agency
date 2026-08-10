/* ============================================================================
   SCENE A — THE POOLING ENGINE                       (BUILD-BRIEF Phase 3)

   PEDAGOGY GATE
   Misconception targeted: students think a mutual fund "is a share" or that the
     fund manager holds their money personally. They cannot picture aggregation.
   Why 3D beats a static diagram: aggregation and diversification are volumetric —
     many small quantities becoming one, then one becoming many again. Flow over
     time in space is exactly what a flat arrow diagram cannot show.
   What the student can do after this that they couldn't before: explain,
     unprompted, why diversification reduces risk and why the unit is a
     proportionate slice rather than a share certificate.
   ============================================================================ */
(function (root) {
  'use strict';

  var G = root.MF3D.gl, U = root.MF3D.util;
  var P = G.PAL;

  var N_TOK = 40;
  var CORP = { x: 0, y: 0.5, z: 0, r: 1.85, h: 2.9 };
  var AMC = { x: 4.4, y: 1.1, z: 0 };
  var CLUS = [
    { key: 'equity', x: 8.3, y: 4.0, z: 0, col: P.gold, label: 'EQUITY SHARES' },
    { key: 'bonds', x: 8.3, y: 0.9, z: 0, col: P.info, label: 'DEBENTURES &amp; BONDS' },
    { key: 'mmi', x: 8.3, y: -2.2, z: 0, col: P.success, label: 'MONEY-MARKET INSTRUMENTS' }
  ];
  var PER_CLUS = 7;

  /* Deterministic scatter — the same savers every time the scene is opened. */
  var TOK = [];
  for (var i = 0; i < N_TOK; i++) {
    TOK.push({
      x: -7.4 + G.rnd(i, 1) * 2.1,
      y: -1.5 + G.rnd(i, 2) * 4.6,
      z: -2.7 + G.rnd(i, 3) * 5.4,
      r: 0.15 + G.rnd(i, 4) * 0.23,
      a: G.rnd(i, 5) * Math.PI * 2,
      lag: G.rnd(i, 6) * 0.42
    });
  }

  var LAT = [];
  (function () {
    for (var ix = 0; ix < 5; ix++) {
      for (var iz = 0; iz < 5; iz++) {
        var x = (ix - 2) * 0.68, z = (iz - 2) * 0.68;
        if (Math.hypot(x, z) > 1.52) continue;
        for (var iy = 0; iy < 6; iy++) {
          LAT.push({ x: x, y: CORP.y + (iy - 2.5) * 0.47, z: z, o: LAT.length });
        }
      }
    }
  })();

  function ph(idx, at, cur, t) { return idx > at ? 1 : idx === at ? t : 0; }

  var STEPS = [
    { cam: { tx: -4.6, ty: 0.9, tz: 0, dist: 12.5, theta: 0.52, phi: 1.26, fov: 44 }, dur: 7000, anim: 1.4 },
    { cam: { tx: -2.2, ty: 0.9, tz: 0, dist: 11.5, theta: 0.48, phi: 1.22, fov: 44 }, dur: 7000, anim: 2.6 },
    { cam: { tx: 0, ty: 0.6, tz: 0, dist: 7.6, theta: 0.80, phi: 1.16, fov: 42 }, dur: 9500, anim: 2.4 },
    { cam: { tx: 2.2, ty: 1.0, tz: 0, dist: 10.5, theta: 1.22, phi: 1.08, fov: 43 }, dur: 7500, anim: 1.8 },
    { cam: { tx: 5.4, ty: 1.0, tz: 0, dist: 12.0, theta: 0.58, phi: 1.16, fov: 44 }, dur: 10500, anim: 2.2 },
    { cam: { tx: 0.6, ty: 0.2, tz: 0, dist: 16.5, theta: 0.46, phi: 1.30, fov: 46 }, dur: 8500, anim: 2.6 }
  ];

  function build(ctx) {
    var rd = ctx.rd, g = ctx.geo, L = ctx.labels, st = ctx.state;
    rd.fogRange = [16, 52];

    var mTok = rd.mesh(g.cyl, N_TOK + 4);
    var mShell = rd.mesh(g.cyl, 3, { transparent: true, depthWrite: false });
    var mLat = rd.mesh(g.box, LAT.length + 2);
    var mNode = rd.mesh(g.box, 3);
    var mRing = rd.mesh(g.torus, 4, { transparent: true, depthWrite: false });
    var mBeam = rd.mesh(g.tube, 8, { transparent: true, depthWrite: false });
    var mSec = rd.mesh(g.sphere, CLUS.length * PER_CLUS + 2);
    var mPart = rd.mesh(g.sphereLo, 90);
    var mGhost = rd.mesh(g.box, 4, { transparent: true, depthWrite: false });

    var lab = {
      savers: L.add('SMALL SAVERS<i>unequal contributions</i>', 'k'),
      corpus: L.add('CORPUS<i>the scheme</i>', 'k'),
      units: L.add('UNITS<i>equal portions · initial offer price &#8377;10</i>', 'k gold'),
      amc: L.add('AMC<i>the fund manager</i>', 'k'),
      ret: L.add('RETURNS<i>in proportion to units held</i>', 'k'),
      shock: L.add('', 'k warn')
    };
    CLUS.forEach(function (c) { lab[c.key] = L.add(c.label, 'k sm'); lab[c.key].off = [0, -16]; });
    lab.savers.off = [0, -6];
    lab.units.off = [0, 10];

    var shockT = 0;

    /* Energy travelling along a beam — the pool is not a static plumbing
       diagram, money is actually moving through it. */
    function flow(a, b, count, colour, amount, speed, spread) {
      if (amount <= 0.01) return;
      var mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + (spread || 0.5), (a[2] + b[2]) / 2];
      for (var i = 0; i < count; i++) {
        var u = ((time0 * (speed || 0.34)) + i / count) % 1;
        var pt = G.bez(a, mid, b, u);
        var fade = Math.sin(u * Math.PI);
        var sz = (0.1 + 0.07 * fade) * amount;
        mPart.push(pt[0], pt[1], pt[2], sz, sz, sz, 0, 0, 0, colour, amount * (0.35 + 0.65 * fade), 0.5, 0.5);
      }
    }
    var time0 = 0;

    function frame(dt, time, idx, t) {
      time0 = time;
      var a1 = ph(idx, 1, idx, t), a2 = ph(idx, 2, idx, t), a3 = ph(idx, 3, idx, t),
          a4 = ph(idx, 4, idx, t), a5 = ph(idx, 5, idx, t);
      var target = st.shock ? 1 : 0;
      shockT += (target - shockT) * (1 - Math.exp(-4.5 * Math.min(dt, 0.1)));
      if (Math.abs(target - shockT) < 0.001) shockT = target;

      /* ---- 1. savers, and their journey into the corpus ---- */
      mTok.clear();
      var poolOpen = a1;
      for (var i = 0; i < N_TOK; i++) {
        var k = TOK[i];
        var tt = G.sat((poolOpen - k.lag) / 0.58);
        var e = G.ease(tt);
        var spin = tt > 0 && tt < 1 ? tt * 7 : 0;
        var ang = k.a;
        var ex = Math.cos(ang) * CORP.r * 0.85, ez = Math.sin(ang) * CORP.r * 0.85;
        var cx = (k.x + ex) / 2 + 0.4, cy = Math.max(k.y, 2.6) + 1.5, cz = (k.z + ez) / 2;
        var px = (1 - e) * (1 - e) * k.x + 2 * (1 - e) * e * cx + e * e * ex;
        var py = (1 - e) * (1 - e) * k.y + 2 * (1 - e) * e * cy + e * e * (CORP.y + CORP.h * 0.42);
        var pz = (1 - e) * (1 - e) * k.z + 2 * (1 - e) * e * cz + e * e * ez;
        var scale = k.r * 2 * (1 - G.sat((tt - 0.72) / 0.28));
        /* Step 6 brings the same savers back to receive their returns. */
        if (a5 > 0) {
          var back = G.easeOut(G.sat((a5 - k.lag * 0.5) / 0.5));
          px = G.lerp(px, k.x, back); py = G.lerp(py, k.y, back); pz = G.lerp(pz, k.z, back);
          scale = G.lerp(scale, k.r * 2, back);
        }
        if (scale < 0.005) continue;
        var glow = a5 > 0 ? 0.16 * (0.55 + 0.45 * Math.sin(time * 2.4 + i)) * G.sat((a5 - 0.35) / 0.4) : 0;
        var wobble = Math.sin(time * 1.1 + i * 1.7) * 0.05 * (1 - e);
        mTok.push(px, py + wobble, pz, scale, scale * 0.34, scale, Math.PI / 2 + spin, ang, 0,
          G.mixc(P.goldDeep, P.gold, k.r * 2.2), 1, glow, 0.25);
      }

      /* ---- 2. the corpus itself ---- */
      mShell.clear();
      if (a1 > 0.02) {
        var fill = G.ease(G.sat(a1 * 1.15));
        var dip = 1 - 0.133 * shockT;                 // one third of the pool, down 40%
        var h = CORP.h * fill * (idx >= 4 ? dip : 1);
        var alpha = 0.30 - 0.13 * a2;
        mShell.push(CORP.x, CORP.y - CORP.h / 2 + h / 2, CORP.z, CORP.r * 2, h, CORP.r * 2, 0, 0, 0,
          G.mixc(P.gold, P.goldBright, 0.2), alpha, 0.05, 0.9);
      }

      /* ---- 3. the corpus subdivides into identical units ---- */
      mLat.clear();
      if (a2 > 0) {
        for (var j = 0; j < LAT.length; j++) {
          var c = LAT[j];
          var appear = G.sat((a2 - (j / LAT.length) * 0.45) / 0.5);
          if (appear <= 0.001) continue;
          var s = 0.5 * G.back(appear);
          var lift = (1 - G.easeOut(appear)) * 0.55;
          mLat.push(c.x, c.y + lift, c.z, s, s, s, 0, 0, 0, P.gold, 1,
            0.06 + 0.3 * (1 - appear), 0.35);
        }
      }

      /* ---- 4. the AMC, deliberately outside the pool ---- */
      mNode.clear();
      mRing.clear();
      mBeam.clear();
      mPart.clear();
      if (a3 > 0) {
        var ns = 1.35 * G.back(a3) * (1 + Math.sin(time * 1.7) * 0.015);
        mNode.push(AMC.x, AMC.y, AMC.z, ns, ns, ns, 0, Math.PI / 4 + time * 0.12, Math.PI / 5,
          G.mixc(P.bg4, P.goldDeep, 0.55), 1, 0.05, 0.7);
        mRing.push(AMC.x, AMC.y, AMC.z, 4.6 * G.easeOut(a3), 4.6 * G.easeOut(a3), 4.6 * G.easeOut(a3),
          0.34, time * 0.25, 0, P.gold, 0.32 * a3, 0.25, 0.6);
        mBeam.link([CORP.x + CORP.r * 0.9, CORP.y + 0.5, 0],
          [AMC.x - 1.0, AMC.y, 0], 0.12 * a3, P.gold, 0.55 * a3, 0.35, 0.4);
        flow([CORP.x + CORP.r * 0.9, CORP.y + 0.5, 0], [AMC.x - 1.0, AMC.y, 0], 4, P.goldBright, a3, 0.4, 0.35);
      }

      /* ---- 5. three streams, three clusters, moving independently ---- */
      mSec.clear();
      for (var ci = 0; ci < CLUS.length; ci++) {
        var cl = CLUS[ci];
        var appear = G.sat((a4 - ci * 0.12) / 0.62);
        if (appear <= 0.001) { lab[cl.key].on = false; continue; }
        if (a4 > 0.15) {
          mBeam.link([AMC.x + 0.9, AMC.y, 0],
            [cl.x - 1.1, cl.y, 0], 0.10, cl.col, 0.5 * appear, 0.3, 0.4);
          flow([AMC.x + 0.9, AMC.y, 0], [cl.x - 1.1, cl.y, 0], 3, cl.col, appear, 0.3, 0.3);
        }
        var hit = cl.key === 'equity' ? shockT : 0;
        for (var s2 = 0; s2 < PER_CLUS; s2++) {
          var seed = ci * 31 + s2;
          var rr = 0.28 + G.rnd(seed, 7) * 0.2;
          var ox = (G.rnd(seed, 8) - 0.5) * 1.7, oy = (G.rnd(seed, 9) - 0.5) * 1.5, oz = (G.rnd(seed, 10) - 0.5) * 1.7;
          /* Independent frequencies — the visual proof that they do not fall
             together. facts.benefits[1]: "seldom stocks value decline in the
             same proportion". */
          var f = 0.5 + G.rnd(seed, 11) * 1.1, phz = G.rnd(seed, 12) * 6.28;
          var jx = Math.sin(time * f + phz) * 0.14;
          var jy = Math.cos(time * (f * 0.8 + 0.3) + phz) * 0.18;
          var col = hit > 0 ? G.mixc(cl.col, P.warn, hit) : cl.col;
          var drop = hit * 1.5;
          var sc = rr * 2 * G.easeOut(appear) * (1 - 0.28 * hit);
          mSec.push(cl.x + ox + jx, cl.y + oy + jy - drop, cl.z + oz, sc, sc, sc, 0, 0, 0,
            col, 1, 0.05, 0.35);
        }
        lab[cl.key].on = true;
        lab[cl.key].p = [cl.x, cl.y + 1.45, cl.z];
      }

      /* ---- 6. returns flow back along the ring ---- */
      if (a5 > 0) {
        mRing.push(0.4, -2.75, 0, 19, 19, 19, 0, 0, 0, P.gold, 0.5 * a5, 0.42, 0.7);
        var n = 10, rad = 9.03;
        for (var q = 0; q < n; q++) {
          for (var tail = 0; tail < 4; tail++) {
            var u = ((time * 0.1) + q / n - tail * 0.011) % 1;
            if (u < 0) u += 1;
            var th = Math.PI * 2 * u;
            var px2 = 0.4 + Math.cos(th) * rad, pz2 = Math.sin(th) * rad;
            var sz = (0.26 - tail * 0.05) * (0.85 + 0.15 * Math.sin(time * 3 + q));
            mPart.push(px2, -2.75, pz2, sz, sz, sz, 0, 0, 0,
              P.goldBright, (0.95 - tail * 0.2) * a5, 0.55 - tail * 0.1, 0.6);
          }
        }
      }

      /* ---- the diversification shock, and its undiversified ghost ---- */
      mGhost.clear();
      if (shockT > 0.01) {
        var gh = 2.9 * (1 - 0.4 * shockT);
        mGhost.push(-3.5, CORP.y - CORP.h / 2 + gh / 2, 0, 0.9, gh, 0.9, 0, 0, 0,
          P.warn, 0.34 + 0.16 * shockT, 0.1, 0.7);
        lab.shock.on = true;
        lab.shock.p = [-3.5, CORP.y - CORP.h / 2 + gh + 0.75, 0];
        lab.shock.el.innerHTML = 'UNDIVERSIFIED<i>&minus;40% &mdash; all of it in that one sector</i>';
      } else {
        lab.shock.on = false;
      }

      /* ---- labels ---- */
      lab.savers.on = true; lab.savers.p = [-6.4, 3.7, 0];
      lab.corpus.on = a1 > 0.25; lab.corpus.p = [CORP.x, CORP.y + CORP.h / 2 + 0.9, CORP.z];
      lab.units.on = a2 > 0.35; lab.units.p = [CORP.x, CORP.y - CORP.h / 2 - 0.85, CORP.z];
      lab.amc.on = a3 > 0.3; lab.amc.p = [AMC.x, AMC.y + 2.2, AMC.z];
      lab.ret.on = a5 > 0.35; lab.ret.p = [-0.6, -3.5, 5.2];
      if (shockT > 0.01) {
        lab.corpus.el.innerHTML = 'CORPUS<i>&minus;' + (13.3 * shockT).toFixed(1) + '% &mdash; one sector of three fell 40%</i>';
      } else {
        lab.corpus.el.innerHTML = 'CORPUS<i>the scheme</i>';
      }
    }

    return { frame: frame, dispose: function () { /* meshes are freed by the renderer */ } };
  }

  /* ---------------------------------------------------------------- panel */

  function panel(ctx, host) {
    var st = ctx.state;
    var row = ctx.el('div', 's3d-row');
    var b = ctx.btn('Shock one sector &minus;40%', 's3d-shock',
      'Drop the equity cluster 40% and compare the pool against an undiversified holding');
    var reset = ctx.btn('Recover', '', 'Undo the shock');
    var out = ctx.el('div', 's3d-readout');

    function render() {
      out.innerHTML = st.shock
        ? '<b>Pool &minus;13.3%</b> &nbsp;·&nbsp; undiversified holding <b class="w">&minus;40%</b> &nbsp;·&nbsp; ' +
          '<i>the same 40% fall, three times smaller, because only one part of the portfolio was in it.</i>'
        : 'The pool is spread across equity shares, debentures and bonds, and money-market instruments. Knock one sector down and watch what reaches the pool.';
      b.classList.toggle('done', !!st.shock);
      reset.disabled = !st.shock;
    }
    b.addEventListener('click', function () { st.shock = !st.shock; render(); ctx.refresh(); });
    reset.addEventListener('click', function () { st.shock = false; render(); ctx.refresh(); });
    row.appendChild(b); row.appendChild(reset);
    host.appendChild(row);
    host.appendChild(out);
    host.appendChild(U.illustrative('equal thirds and a 40% fall are a worked demonstration'));
    var q = ctx.el('p', 's3d-quote',
      '<b>Textbook:</b> &ldquo;' + ctx.facts.benefits[1].text + '&rdquo;');
    host.appendChild(q);
    render();
    return { refresh: render };
  }

  /* ----------------------------------------------------------------- flat */

  function flat(ctx) {
    var st = ctx.state;
    var wrap = ctx.el('div', 's3d-flatbox');
    var s = U.svgRoot(760, 340,
      'Flat diagram of the pooling engine: unequal contributions form one corpus, the corpus divides into equal units, the AMC spreads it across three kinds of security, and returns flow back');
    var groups = {};
    function grp(id) { var g = U.svg('g', { class: 'f-el', id: 'fa-' + id }); groups[id] = g; s.appendChild(g); return g; }

    var g0 = grp('savers');
    g0.appendChild(U.svg('text', { x: 8, y: 18, class: 'svg-t-gold' }, 'UNEQUAL CONTRIBUTIONS'));
    [[46, 14], [52, 20], [40, 10], [50, 17]].forEach(function (d, i) {
      var cy = 54 + i * 46;
      g0.appendChild(U.svg('circle', { cx: d[0], cy: cy, r: d[1], class: 'svg-node-gold' }));
      g0.appendChild(U.svg('text', { x: d[0], y: cy + 4, 'text-anchor': 'middle', class: 'svg-t-sm' }, '₹'));
    });

    var g1 = grp('flow');
    [54, 100, 146, 192].forEach(function (y) {
      g1.appendChild(U.svg('path', { d: 'M78 ' + y + ' C 140 ' + y + ', 150 124, 196 124', class: 'svg-flow' }));
    });

    var g2 = grp('corpus');
    g2.appendChild(U.svg('rect', { x: 200, y: 62, width: 116, height: 124, rx: 3, class: 'svg-node-gold' }));
    g2.appendChild(U.svg('text', { x: 258, y: 108, 'text-anchor': 'middle', class: 'svg-t' }, 'CORPUS'));
    g2.appendChild(U.svg('text', { x: 258, y: 128, 'text-anchor': 'middle', class: 'svg-t-sm' }, 'ONE POOL'));

    var g3 = grp('units');
    for (var r = 0; r < 4; r++) {
      for (var c = 0; c < 5; c++) {
        g3.appendChild(U.svg('rect', { x: 208 + c * 21, y: 200 + r * 21, width: 16, height: 16, rx: 2, class: 'svg-node-gold' }));
      }
    }
    g3.appendChild(U.svg('text', { x: 258, y: 300, 'text-anchor': 'middle', class: 'svg-t-gold' }, 'UNITS — ALL IDENTICAL'));
    g3.appendChild(U.svg('text', { x: 258, y: 316, 'text-anchor': 'middle', class: 'svg-t-sm' }, 'INITIAL OFFER PRICE ₹10'));

    var g4 = grp('amc');
    g4.appendChild(U.svg('path', { d: 'M320 124 L 386 124', class: 'svg-flow' }));
    g4.appendChild(U.svg('rect', { x: 390, y: 100, width: 104, height: 48, rx: 3, class: 'svg-node' }));
    g4.appendChild(U.svg('text', { x: 442, y: 122, 'text-anchor': 'middle', class: 'svg-t' }, 'AMC'));
    g4.appendChild(U.svg('text', { x: 442, y: 138, 'text-anchor': 'middle', class: 'svg-t-sm' }, 'FUND MANAGER'));

    var g5 = grp('sec');
    var secs = [['EQUITY SHARES', '#c9a961', 40], ['DEBENTURES & BONDS', '#7ca69a', 106], ['MONEY-MARKET INSTR.', '#9cb37a', 172]];
    secs.forEach(function (d) {
      g5.appendChild(U.svg('path', { d: 'M496 124 L 552 ' + (d[2] + 22), class: 'svg-line' }));
      g5.appendChild(U.svg('rect', { x: 556, y: d[2], width: 196, height: 44, rx: 3, fill: 'none', stroke: d[1], 'stroke-width': '1.1' }));
      g5.appendChild(U.svg('text', { x: 654, y: d[2] + 27, 'text-anchor': 'middle', class: 'svg-t' }, d[0]));
    });
    g5.appendChild(U.svg('text', { x: 654, y: 236, 'text-anchor': 'middle', class: 'svg-t-gold' }, 'RISK DIVERSIFICATION'));

    var g6 = grp('ret');
    g6.appendChild(U.svg('path', { d: 'M752 216 C 770 300, 300 330, 60 268', class: 'svg-flow', 'stroke-dasharray': '4 4' }));
    g6.appendChild(U.svg('path', { d: 'M70 262 L 56 268 L 70 274 Z', fill: '#8a7340' }));
    g6.appendChild(U.svg('text', { x: 400, y: 316, 'text-anchor': 'middle', class: 'svg-t-sm' }, 'RETURNS FLOW BACK IN PROPORTION TO UNITS HELD'));

    wrap.appendChild(s);

    /* The shock, kept working in Lite exactly as it works in 3D. */
    var shockBox = ctx.el('div', 's3d-flatshock');
    var sv = U.svgRoot(760, 132, 'Comparison of a diversified pool against an undiversified holding after one sector falls 40 per cent');
    var bars = { pool: null, ghost: null, poolT: null, ghostT: null };
    function bar(x, label, cls) {
      var g = U.svg('g');
      g.appendChild(U.svg('text', { x: x + 54, y: 16, 'text-anchor': 'middle', class: 'svg-t-sm' }, label));
      var track = U.svg('rect', { x: x, y: 24, width: 108, height: 84, rx: 2, fill: 'none', stroke: '#2a2520' });
      var fillR = U.svg('rect', { x: x, y: 24, width: 108, height: 84, rx: 2, class: cls });
      var txt = U.svg('text', { x: x + 54, y: 126, 'text-anchor': 'middle', class: 'svg-t-gold' }, '100%');
      g.appendChild(track); g.appendChild(fillR); g.appendChild(txt);
      sv.appendChild(g);
      return { r: fillR, t: txt, y0: 24, h: 84 };
    }
    bars.pool = bar(90, 'DIVERSIFIED POOL', 'svg-node-gold');
    bars.ghost = bar(300, 'ALL IN ONE SECTOR', 'svg-warnfill');
    sv.appendChild(U.svg('text', { x: 470, y: 56, class: 'svg-t' }, 'One sector of three falls 40%.'));
    var verdict = U.svg('text', { x: 470, y: 80, class: 'svg-t-gold' }, 'PRESS SHOCK ONE SECTOR');
    sv.appendChild(verdict);
    shockBox.appendChild(sv);
    wrap.appendChild(shockBox);

    function setBar(b, pct) {
      var h = b.h * pct;
      b.r.setAttribute('y', String(b.y0 + (b.h - h)));
      b.r.setAttribute('height', String(Math.max(1, h)));
      b.t.textContent = Math.round(pct * 100) + '%';
    }
    function render() {
      var on = !!st.shock;
      setBar(bars.pool, on ? 0.867 : 1);
      setBar(bars.ghost, on ? 0.6 : 1);
      verdict.textContent = on ? 'POOL −13.3%  ·  UNDIVERSIFIED −40%' : 'PRESS SHOCK ONE SECTOR';
    }
    render();

    var order = ['savers', 'flow', 'corpus', 'units', 'amc', 'sec', 'ret'];
    function step(i) {
      /* Step 1 lights the savers; every later step is cumulative. */
      var upto = [0, 2, 3, 4, 5, 6][i] !== undefined ? [0, 2, 3, 4, 5, 6][i] : 6;
      order.forEach(function (k, n) { groups[k].classList.toggle('on', n <= upto); });
    }
    step(0);
    return { node: wrap, step: step, refresh: render };
  }

  root.MF3D.defA = {
    id: 'pool',
    mount: '#mount-scene-a',
    kick: 'Scene A',
    title: 'The pooling engine',
    hot: true,
    state: { shock: false },
    steps: root.MF_FACTS.narration.pool.map(function (say, i) {
      return { say: say, dur: STEPS[i].dur, anim: STEPS[i].anim, cam: STEPS[i].cam };
    }),
    gate: {
      misconception: 'that a mutual fund "is a share", and that the manager holds your money personally.',
      why3d: 'aggregation and diversification are volumetric — many small quantities becoming one, then one becoming many.',
      after: 'explain why diversification reduces risk, and why a unit is a proportionate slice.'
    },
    build: build, panel: panel, flat: flat
  };
})(window);
