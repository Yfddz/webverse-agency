/* ============================================================================
   SCENE C — OPEN vs CLOSED CORPUS                     (BUILD-BRIEF Phase 5)

   PEDAGOGY GATE
   Misconception targeted: swapping the listing row — students write that
     open-ended units are listed. They also write that a closed-ended investor
     "cannot sell at all" before maturity.
   Why 3D beats a static diagram: the six differences are six consequences of
     one structural fact. Seeing the containers behave over a scrubbable
     timeline makes the table derivable instead of memorised.
   What the student can do after this that they couldn't before: rebuild all six
     rows from the single sentence "open = permanent AMC counter, closed =
     sealed pool with an exchange side-door".
   ============================================================================ */
(function (root) {
  'use strict';

  var G = root.MF3D.gl, U = root.MF3D.util;
  var P = G.PAL;
  var F = root.MF_FACTS;

  var CLOSED = { x: -6.0, w: 2.9, h: 3.2, d: 2.9 };
  var OPEN = { x: 0.7, w: 2.9, h: 3.2, d: 2.9 };
  var INTER = { x: 6.9, w: 2.6, h: 3.0, d: 2.6 };
  var BASE = -1.9;
  var RAIL = { y: -3.6, z: 3.1, x0: -8.2, x1: 8.2 };

  /* Where the camera goes when a differences row is selected, and where the
     pickable hot-spot lives in world space. Ids come from facts.differences. */
  var FEATURES = {
    'lid': { p: [CLOSED.x, BASE + CLOSED.h + 0.25, 0], r: 1.7, cam: { tx: -5.2, ty: 0.9, tz: 0, dist: 7.5, theta: 0.5, phi: 1.15 } },
    'container-volume': { p: [CLOSED.x, BASE + CLOSED.h / 2, 0], r: 1.9, cam: { tx: -2.6, ty: 0.2, tz: 0, dist: 12.5, theta: 0.36, phi: 1.24 } },
    'exit-flow': { p: [CLOSED.x - 2.4, BASE + 1.1, 1.7], r: 1.5, cam: { tx: -7.2, ty: 0.4, tz: 1.2, dist: 8.0, theta: 0.75, phi: 1.22 } },
    'exchange-door': { p: [CLOSED.x - 1.55, BASE + 1.1, 0.9], r: 1.2, cam: { tx: -6.6, ty: 0.5, tz: 0.8, dist: 6.8, theta: 0.95, phi: 1.20 } },
    'amc-counter': { p: [OPEN.x, BASE - 0.55, 2.3], r: 1.5, cam: { tx: 0.7, ty: -0.7, tz: 1.6, dist: 7.6, theta: 0.28, phi: 1.28 } },
    'maturity-gate': { p: [CLOSED.x + 1.9, BASE + 0.9, 0], r: 1.3, cam: { tx: -4.2, ty: 0.4, tz: 0, dist: 7.4, theta: -0.35, phi: 1.20 } }
  };

  var STEPS = [
    { dur: 7500, anim: 1.6, time: 0.05, cam: { tx: -5.6, ty: 0.2, tz: 0, dist: 10.5, theta: 0.42, phi: 1.22, fov: 43 } },
    { dur: 7000, anim: 1.8, time: 0.22, cam: { tx: -5.4, ty: 1.0, tz: 0, dist: 8.2, theta: 0.52, phi: 1.10, fov: 43 } },
    { dur: 8500, anim: 2.0, time: 0.45, cam: { tx: -7.0, ty: 0.3, tz: 1.2, dist: 8.6, theta: 0.85, phi: 1.20, fov: 43 } },
    { dur: 7000, anim: 2.0, time: 1.00, cam: { tx: -4.4, ty: 0.3, tz: 0, dist: 8.4, theta: -0.30, phi: 1.18, fov: 43 } },
    { dur: 9000, anim: 2.2, time: 0.55, cam: { tx: 0.9, ty: 0.0, tz: 1.0, dist: 9.4, theta: 0.34, phi: 1.22, fov: 43 } },
    { dur: 9500, anim: 2.4, time: 0.62, cam: { tx: 0.2, ty: 0.0, tz: 0, dist: 17.5, theta: 0.40, phi: 1.26, fov: 46 } }
  ];

  /* Interval funds are open for purchase or redemption during specific
     intervals and closed the rest of the time (facts.typesByOperation). */
  var WINDOWS = [[0.00, 0.12], [0.34, 0.44], [0.66, 0.76]];
  function inWindow(t) {
    for (var i = 0; i < WINDOWS.length; i++) if (t >= WINDOWS[i][0] && t <= WINDOWS[i][1]) return true;
    return false;
  }
  var NFO_END = 0.15;

  function boxWalls(mesh, mEdge, cx, w, h, d, col, alpha, y0) {
    var W = w / 2, D = d / 2, t = 0.06;
    mesh.push(cx, y0 + h / 2, -D, w, h, t, 0, 0, 0, col, alpha, 0, 0.5);
    mesh.push(cx, y0 + h / 2, D, w, h, t, 0, 0, 0, col, alpha * 0.6, 0, 0.5);
    mesh.push(cx - W, y0 + h / 2, 0, t, h, d, 0, 0, 0, col, alpha * 0.8, 0, 0.5);
    mesh.push(cx + W, y0 + h / 2, 0, t, h, d, 0, 0, 0, col, alpha * 0.8, 0, 0.5);
    mesh.push(cx, y0, 0, w, t, d, 0, 0, 0, P.bg3, 0.9, 0, 0.4);
    var c = [[cx - W, -D], [cx + W, -D], [cx + W, D], [cx - W, D]];
    for (var i = 0; i < 4; i++) {
      var a = c[i], b = c[(i + 1) % 4];
      mEdge.link([a[0], y0, a[1]], [a[0], y0 + h, a[1]], 0.04, P.borderStrong, 1, 0, 0.35);
      mEdge.link([a[0], y0, a[1]], [b[0], y0, b[1]], 0.04, P.borderStrong, 1, 0, 0.35);
      mEdge.link([a[0], y0 + h, a[1]], [b[0], y0 + h, b[1]], 0.04, P.goldDeep, 1, 0.04, 0.4);
    }
  }

  function build(ctx) {
    var rd = ctx.rd, g = ctx.geo, L = ctx.labels, st = ctx.state;
    rd.fogRange = [18, 56];

    var mGlass = rd.mesh(g.box, 20, { transparent: true, depthWrite: false });
    var mEdge = rd.mesh(g.tube, 48);
    var mSolid = rd.mesh(g.box, 40);
    var mGlow = rd.mesh(g.box, 12, { transparent: true, depthWrite: false });
    var mPart = rd.mesh(g.sphereLo, 60);
    var mRail = rd.mesh(g.box, 40);
    var mHalo = rd.mesh(g.sphere, 4, { transparent: true, depthWrite: false });

    var lab = {
      closed: L.add('CLOSED-ENDED<i>corpus fixed &middot; life pre-fixed</i>', 'k'),
      open: L.add('OPEN-ENDED<i>size and period not pre-fixed</i>', 'k'),
      inter: L.add('INTERVAL<i>open during specific intervals</i>', 'k sm'),
      exch: L.add('STOCK EXCHANGE<i>the only exit before maturity</i>', 'k sm'),
      counter: L.add('AMC COUNTER<i>buy and redeem directly, any time</i>', 'k sm'),
      gate: L.add('MATURITY GATE', 'k sm'),
      lid: L.add('LID', 'k sm'),
      noexch: L.add('NO EXCHANGE HERE<i>the AMC is always the buyer</i>', 'k sm'),
      t0: L.add('OFFER PERIOD', 'k tick'),
      t1: L.add('LIFE OF THE FUND', 'k tick'),
      t2: L.add('MATURITY', 'k tick')
    };
    lab.closed.off = [0, -6]; lab.open.off = [0, -6]; lab.inter.off = [0, -6];
    lab.exch.off = [0, -8]; lab.counter.off = [0, 36]; lab.gate.off = [0, -8];
    lab.lid.off = [-10, 0]; lab.noexch.off = [0, 0];
    lab.t0.off = [0, 22]; lab.t1.off = [0, 22]; lab.t2.off = [0, 22];

    var hiT = 0;

    function frame(dt, time, idx, t) {
      var T = st.time;
      var sealed = G.sat((T - NFO_END) / 0.06);
      var open = st.hi;
      hiT += ((open ? 1 : 0) - hiT) * (1 - Math.exp(-7 * Math.min(dt, 0.1)));

      function hl(id) { return st.hi === id ? 0.55 + 0.45 * Math.sin(time * 4) : 0; }

      mGlass.clear(); mEdge.clear(); mSolid.clear(); mGlow.clear(); mPart.clear(); mRail.clear(); mHalo.clear();

      /* ------------------------------------------------ closed-ended scheme */
      boxWalls(mGlass, mEdge, CLOSED.x, CLOSED.w, CLOSED.h, CLOSED.d, P.bg4, 0.16, BASE);
      /* corpus level: fills during the offer, then never changes */
      var fill = CLOSED.h * (0.32 + 0.5 * G.sat(T / NFO_END));
      mSolid.push(CLOSED.x, BASE + fill / 2, 0, CLOSED.w - 0.24, fill, CLOSED.d - 0.24, 0, 0, 0,
        G.mixc(P.goldDeep, P.gold, 0.45), 1, 0.04 + hl('container-volume') * 0.25, 0.4 + hl('container-volume'));
      mSolid.push(CLOSED.x, BASE + fill, 0, CLOSED.w - 0.20, 0.05, CLOSED.d - 0.20, 0, 0, 0,
        P.goldBright, 1, 0.3, 0.9);
      /* the pre-fixed maximum, drawn as a hard ceiling that is never exceeded */
      mGlow.push(CLOSED.x, BASE + CLOSED.h * 0.86, 0, CLOSED.w + 0.12, 0.05, CLOSED.d + 0.12, 0, 0, 0,
        P.warn, 0.5 + hl('container-volume') * 0.5, 0.2, 0.6);

      /* lid — seals when the offer period closes */
      var lidY = BASE + CLOSED.h + 0.95 * (1 - G.settle(sealed, 13, 7));
      mSolid.push(CLOSED.x, lidY + 0.07, 0, CLOSED.w + 0.18, 0.13, CLOSED.d + 0.18, 0, 0, 0,
        G.mixc(P.bg4, P.warn, 0.12 + 0.3 * sealed), 1, 0.03 + hl('lid') * 0.3, 0.45 + hl('lid'));

      /* stock-exchange pylon and its glowing side door */
      var ex = [CLOSED.x - 3.7, BASE - 0.25, 2.7];
      mSolid.push(ex[0], ex[1] + 0.9, ex[2], 1.5, 1.8, 1.0, 0, 0.34, 0, P.bg4, 1, 0.03, 0.45);
      mSolid.push(ex[0], ex[1] + 1.86, ex[2], 1.62, 0.1, 1.12, 0, 0.34, 0, P.info, 1, 0.18, 0.6);
      mGlow.push(CLOSED.x - CLOSED.w / 2 - 0.02, BASE + 1.0, 0.85, 0.06, 1.5, 0.95, 0, 0, 0,
        P.info, 0.55 + 0.35 * Math.sin(time * 1.6) * 0.4 + hl('exchange-door') * 0.4, 0.45 + hl('exchange-door'), 0.8);

      /* exit flow — units leaving through the exchange, available all life */
      if (T > NFO_END) {
        for (var q = 0; q < 8; q++) {
          var u = ((time * 0.28) + q / 8) % 1;
          var px = G.lerp(CLOSED.x - CLOSED.w / 2, ex[0] + 0.4, u);
          var py = BASE + 1.0 + Math.sin(u * Math.PI) * 0.55;
          var pz = G.lerp(0.85, ex[2], u);
          var sz = 0.16 * (1 - 0.3 * u);
          mPart.push(px, py, pz, sz, sz, sz, 0, 0, 0, P.info, 0.85, 0.4 + hl('exit-flow') * 0.5, 0.5);
        }
      }

      /* maturity gate at the far end of the fund's life */
      var gateOpen = G.back(G.sat((T - 0.94) / 0.06));
      mSolid.push(CLOSED.x + CLOSED.w / 2 + 0.05, BASE + 0.85 + gateOpen * 1.9, 0, 0.1, 1.7, CLOSED.d * 0.75, 0, 0, 0,
        G.mixc(P.bg4, P.success, 0.2 + 0.5 * gateOpen), 1, 0.04 + gateOpen * 0.25 + hl('maturity-gate') * 0.3, 0.4 + hl('maturity-gate'));
      if (gateOpen > 0.2) {
        for (var q2 = 0; q2 < 6; q2++) {
          var u2 = ((time * 0.5) + q2 / 6) % 1;
          var sz2 = 0.17;
          mPart.push(CLOSED.x + CLOSED.w / 2 + 0.4 + u2 * 2.0, BASE + 0.9, 0, sz2, sz2, sz2, 0, 0, 0,
            P.success, 0.9 * gateOpen * (1 - u2 * 0.5), 0.4, 0.5);
        }
      }

      /* -------------------------------------------------- open-ended scheme */
      /* no lid, and the container itself breathes as investors come and go */
      var breathe = 1 + Math.sin(time * 0.55) * 0.10 + Math.sin(time * 0.31 + 1.4) * 0.06;
      var ow = OPEN.w * breathe, od = OPEN.d * breathe, oh = OPEN.h * (0.85 + 0.15 * breathe);
      boxWalls(mGlass, mEdge, OPEN.x, ow, oh, od, P.bg4, 0.14, BASE);
      var ofill = oh * 0.66;
      mSolid.push(OPEN.x, BASE + ofill / 2, 0, ow - 0.22, ofill, od - 0.22, 0, 0, 0,
        G.mixc(P.goldDeep, P.gold, 0.5), 1, 0.04 + hl('container-volume') * 0.18, 0.4);

      /* AMC counter — a permanent two-way desk in front of the open scheme */
      mSolid.push(OPEN.x, BASE - 0.75, 1.95, 3.4, 0.24, 1.1, 0, 0, 0,
        G.mixc(P.bg4, P.gold, 0.25), 1, 0.04 + hl('amc-counter') * 0.3, 0.4 + hl('amc-counter'));
      mSolid.push(OPEN.x, BASE - 1.25, 1.95, 0.16, 0.75, 0.16, 0, 0, 0, P.bg4, 1, 0.02, 0.35);
      for (var q3 = 0; q3 < 10; q3++) {
        var u3 = ((time * 0.34) + q3 / 10) % 1;
        var dir = q3 % 2 === 0 ? 1 : -1;         /* purchases in, redemptions out */
        var uu = dir > 0 ? u3 : 1 - u3;
        var pxo = OPEN.x + (q3 % 5 - 2) * 0.42;
        var pyo = G.lerp(BASE - 0.55, BASE + 1.4, uu);
        var pzo = G.lerp(1.95, 0.4, uu);
        var szo = 0.15;
        mPart.push(pxo, pyo, pzo, szo, szo, szo, 0, 0, 0,
          dir > 0 ? P.gold : P.success, 0.9, 0.35 + hl('amc-counter') * 0.4, 0.5);
      }

      /* ------------------------------------------------------ interval fund */
      var win = inWindow(T);
      var winT = win ? 1 : 0;
      boxWalls(mGlass, mEdge, INTER.x, INTER.w, INTER.h, INTER.d, P.bg4, 0.12, BASE);
      var ifill = INTER.h * 0.6;
      mSolid.push(INTER.x, BASE + ifill / 2, 0, INTER.w - 0.2, ifill, INTER.d - 0.2, 0, 0, 0,
        G.mixc(P.goldDeep, P.gold, 0.35), 1, 0.03, 0.35);
      st.winT = st.winT === undefined ? winT : st.winT + (winT - st.winT) * (1 - Math.exp(-9 * Math.min(dt, 0.1)));
      var wT = st.winT;
      mSolid.push(INTER.x, BASE + INTER.h + 0.08 + wT * 0.9, 0, INTER.w + 0.14, 0.13, INTER.d + 0.14, 0, 0, wT * 0.24,
        G.mixc(P.bg4, win ? P.success : P.warn, 0.3), 1, 0.03 + wT * 0.12, 0.45);

      /* ------------------------------------------------------------- the rail */
      mRail.push((RAIL.x0 + RAIL.x1) / 2, RAIL.y, RAIL.z, RAIL.x1 - RAIL.x0, 0.06, 0.06, 0, 0, 0, P.borderStrong, 1, 0, 0.3);
      var marks = [0, NFO_END, 0.5, 1];
      for (var m = 0; m < marks.length; m++) {
        var mx = G.lerp(RAIL.x0, RAIL.x1, marks[m]);
        mRail.push(mx, RAIL.y + 0.16, RAIL.z, 0.05, 0.34, 0.05, 0, 0, 0, m === 0 || m === 3 ? P.gold : P.border, 1, 0, 0.3);
      }
      WINDOWS.forEach(function (w) {
        var a = G.lerp(RAIL.x0, RAIL.x1, w[0]), b = G.lerp(RAIL.x0, RAIL.x1, w[1]);
        mRail.push((a + b) / 2, RAIL.y - 0.22, RAIL.z, b - a, 0.07, 0.07, 0, 0, 0, P.success, 1, 0.2, 0.4);
      });
      var hx = G.lerp(RAIL.x0, RAIL.x1, T);
      mRail.push(hx, RAIL.y + 0.42, RAIL.z, 0.16, 0.5, 0.16, 0, 0, 0, P.goldBright, 1, 0.4, 0.7);

      /* ------------------------------------------------- selection halo */
      if (st.hi && FEATURES[st.hi]) {
        var f = FEATURES[st.hi];
        var pulse = f.r * (1.05 + Math.sin(time * 3) * 0.06);
        mHalo.push(f.p[0], f.p[1], f.p[2], pulse * 2, pulse * 2, pulse * 2, 0, 0, 0,
          P.goldBright, 0.10 * hiT, 0.35, 1.2);
      }

      /* ------------------------------------------------------------ labels */
      lab.closed.p = [CLOSED.x, BASE + CLOSED.h + 1.5, 0];
      lab.open.p = [OPEN.x, BASE + OPEN.h + 1.5, 0];
      lab.inter.p = [INTER.x, BASE + INTER.h + 1.2, 0];
      lab.exch.p = [ex[0], ex[1] + 2.2, ex[2]];
      lab.counter.p = [OPEN.x, BASE - 1.35, 1.95];
      lab.gate.p = [CLOSED.x + CLOSED.w / 2 + 0.7, BASE + 2.3, 0];
      lab.lid.p = [CLOSED.x - CLOSED.w / 2 - 0.1, lidY + 0.15, 0];
      lab.noexch.p = [OPEN.x - 3.0, BASE + 4.0, 1.8];
      lab.noexch.on = idx >= 5;
      lab.lid.on = idx === 1 || st.hi === 'lid';
      lab.gate.on = idx === 3 || st.hi === 'maturity-gate';
      lab.exch.on = idx >= 2;
      lab.counter.on = idx >= 4;
      lab.t0.p = [G.lerp(RAIL.x0, RAIL.x1, 0.06), RAIL.y - 0.75, RAIL.z];
      lab.t1.p = [G.lerp(RAIL.x0, RAIL.x1, 0.66), RAIL.y - 0.75, RAIL.z];
      lab.t2.p = [G.lerp(RAIL.x0, RAIL.x1, 0.99), RAIL.y - 0.75, RAIL.z];
    }

    function step(i) {
      if (STEPS[i] && !st.manual) st.time = STEPS[i].time;
      ctx.refresh();
    }

    function pick(ray) {
      var best = null, bt = 1e9;
      for (var k in FEATURES) {
        if (!FEATURES.hasOwnProperty(k)) continue;
        var f = FEATURES[k];
        var t = G.hitSphere(ray, f.p, f.r);
        if (t >= 0 && t < bt) { bt = t; best = k; }
      }
      if (best) { st.hi = st.hi === best ? null : best; ctx.refresh(); }
    }

    return { frame: frame, step: step, pick: pick, dispose: function () {} };
  }

  /* ---------------------------------------------------------------- panel */

  function panel(ctx, host) {
    var st = ctx.state;

    /* --- the scrubber --- */
    var sc = ctx.el('div', 'c-scrub');
    var lb = ctx.el('label', null, 'Timeline of the fund’s life <b></b>');
    var inp = document.createElement('input');
    inp.type = 'range'; inp.min = '0'; inp.max = '1000'; inp.step = '1'; inp.value = '50';
    inp.setAttribute('aria-label', 'Scrub the timeline of the fund’s life');
    inp.addEventListener('input', function () {
      st.manual = true;
      st.time = parseFloat(inp.value) / 1000;
      render();
      ctx.refresh();
    });
    sc.appendChild(lb); sc.appendChild(inp);
    host.appendChild(sc);
    var timeVal = lb.querySelector('b');

    /* --- live can-buy / can-sell chips --- */
    var chips = ctx.el('div', 'c-chips');
    host.appendChild(chips);

    /* --- the six-row differences table, linked both ways --- */
    var tw = ctx.el('div', 'tbl-wrap c-table');
    var tbl = document.createElement('table');
    var head = document.createElement('tr');
    ['Basis of difference', 'Open-ended', 'Closed-ended'].forEach(function (h) {
      var th = document.createElement('th'); th.textContent = h; head.appendChild(th);
    });
    tbl.appendChild(head);
    var rows = {};
    F.differences.forEach(function (d, i) {
      var tr = document.createElement('tr');
      tr.className = 'c-row';
      tr.tabIndex = 0;
      tr.dataset.feature = d.feature3d;
      tr.innerHTML = '<td><strong>' + (i + 1) + '. ' + d.basis + '</strong></td><td>' + d.open + '</td><td>' + d.closed + '</td>';
      tbl.appendChild(tr);
      rows[d.feature3d] = tr;
      function select() { st.hi = st.hi === d.feature3d ? null : d.feature3d; render(); ctx.refresh(); }
      tr.addEventListener('mouseenter', function () { if (!st.pinned) { st.hi = d.feature3d; render(); ctx.refresh(); } });
      tr.addEventListener('mouseleave', function () { if (!st.pinned) { st.hi = null; render(); ctx.refresh(); } });
      tr.addEventListener('click', function () { st.pinned = st.hi !== d.feature3d; select(); });
      tr.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); st.pinned = st.hi !== d.feature3d; select(); }
      });
    });
    tw.appendChild(tbl);
    host.appendChild(tw);
    host.appendChild(ctx.el('p', 's3d-hintline',
      'Hover or tap a row to light up the part of the scene it comes from — or tap a feature in the scene to find its row.'));

    var trap = ctx.el('div', 'callout trap s3d-trap',
      '<span class="callout-label">The listing inversion</span><p>' + F.differencesTrap + '</p>');
    host.appendChild(trap);

    /* Camera follows the selection. */
    function pushCam() {
      var sc3 = ctx.orbit;
      if (!sc3 || ctx.isLite()) return;
      var f = st.hi && FEAT_CAM[st.hi];
      if (f) sc3.set(f, false);
    }
    var FEAT_CAM = {};
    Object.keys(FEATURES).forEach(function (k) { FEAT_CAM[k] = FEATURES[k].cam; });

    function verdict(yes, text) {
      return '<span class="v ' + (yes === true ? 'y' : yes === false ? 'n' : 'm') + '">' +
        (yes === true ? '✓' : yes === false ? '✗' : '◆') + '</span> ' + text;
    }

    function render() {
      var T = st.time;
      inp.value = String(Math.round(T * 1000));
      var phase = T < 0.15 ? 'offer period (NFO)' : T >= 0.99 ? 'maturity' : 'life of the fund';
      timeVal.textContent = phase;

      var nfo = T < 0.15, mat = T >= 0.99, win = inWindow(T);
      chips.innerHTML =
        '<div class="c-card"><h5>Closed-ended</h5>' +
          '<div>' + verdict(nfo, 'Buy <b>from the fund</b>' + (nfo ? '' : ' — closed once the target size is reached')) + '</div>' +
          '<div>' + verdict(mat, 'Redeem <b>from the fund</b>' + (mat ? ' — value of the unit is paid' : ' — only on maturity')) + '</div>' +
          '<div>' + verdict(true, 'Buy or sell <b>on the stock exchange</b> — the units are listed') + '</div>' +
        '</div>' +
        '<div class="c-card"><h5>Open-ended</h5>' +
          '<div>' + verdict(true, 'Buy <b>at the AMC counter</b> — any time') + '</div>' +
          '<div>' + verdict(true, 'Redeem <b>at the AMC counter</b> — as and when required') + '</div>' +
          '<div>' + verdict(false, '<b>Not listed</b> — no exchange is needed, the AMC is the buyer') + '</div>' +
        '</div>' +
        '<div class="c-card"><h5>Interval</h5>' +
          '<div>' + verdict(win, 'Buy or redeem <b>at NAV</b>' + (win ? ' — a window is open' : ' — closed until the next interval')) + '</div>' +
          '<div>' + verdict(true, 'Units are <b>traded in the stock exchange</b>') + '</div>' +
        '</div>';

      Object.keys(rows).forEach(function (k) {
        rows[k].classList.toggle('hi', st.hi === k);
        rows[k].classList.toggle('pinned', st.pinned && st.hi === k);
      });
      pushCam();
    }

    render();
    return { refresh: render };
  }

  /* ----------------------------------------------------------------- flat */

  function flat(ctx) {
    var st = ctx.state;
    var wrap = ctx.el('div', 's3d-flatbox');
    var s = U.svgRoot(760, 300, 'Flat diagram comparing a closed-ended scheme with a sealed lid and a stock-exchange side door, an open-ended scheme with a permanent AMC counter, and an interval scheme with a scheduled lid');
    var reg = {};

    function panelBox(x, title, sub) {
      var g = U.svg('g');
      g.appendChild(U.svg('rect', { x: x, y: 54, width: 200, height: 150, rx: 3, class: 'svg-node' }));
      g.appendChild(U.svg('text', { x: x + 100, y: 40, 'text-anchor': 'middle', class: 'svg-t-gold' }, title));
      g.appendChild(U.svg('text', { x: x + 100, y: 224, 'text-anchor': 'middle', class: 'svg-t-sm' }, sub));
      s.appendChild(g);
      return g;
    }

    panelBox(24, 'CLOSED-ENDED', 'FIXED SIZE · FIXED LIFE');
    panelBox(280, 'OPEN-ENDED', 'NO LID · NO FIXED SIZE');
    panelBox(536, 'INTERVAL', 'OPEN ON A SCHEDULE');

    /* features, each one tagged with the differences row it belongs to */
    function feat(id, node) { node.setAttribute('class', (node.getAttribute('class') || '') + ' f-feat'); reg[id] = reg[id] || []; reg[id].push(node); s.appendChild(node); return node; }

    var lid = U.svg('rect', { x: 34, y: 66, width: 180, height: 14, rx: 2, class: 'svg-warnfill' });
    feat('lid', lid);
    s.appendChild(U.svg('text', { x: 124, y: 76, 'text-anchor': 'middle', class: 'svg-t-sm', fill: '#0b0a08' }, 'SEALED LID'));

    var vol = U.svg('rect', { x: 44, y: 118, width: 160, height: 80, rx: 2, class: 'svg-node-gold' });
    feat('container-volume', vol);
    s.appendChild(U.svg('text', { x: 124, y: 164, 'text-anchor': 'middle', class: 'svg-t-sm' }, 'CORPUS — PRE-FIXED MAXIMUM'));

    var door = U.svg('rect', { x: 20, y: 120, width: 10, height: 56, rx: 1, fill: '#7ca69a' });
    feat('exchange-door', door);
    var exit = U.svg('path', { d: 'M18 148 L -0 148', stroke: '#7ca69a', 'stroke-width': '1.6', fill: 'none' });
    var exitG = U.svg('g');
    exitG.appendChild(U.svg('text', { x: 6, y: 196, class: 'svg-t-sm' }, 'EXCHANGE'));
    exitG.appendChild(exit);
    feat('exit-flow', exitG);

    var gate = U.svg('rect', { x: 214, y: 120, width: 10, height: 56, rx: 1, fill: '#9cb37a' });
    feat('maturity-gate', gate);
    s.appendChild(U.svg('text', { x: 236, y: 114, class: 'svg-t-sm' }, 'MATURITY'));

    var counter = U.svg('rect', { x: 300, y: 208, width: 160, height: 12, rx: 2, class: 'svg-node-gold' });
    feat('amc-counter', counter);
    s.appendChild(U.svg('text', { x: 380, y: 240, 'text-anchor': 'middle', class: 'svg-t-sm' }, 'AMC COUNTER — BOTH WAYS, ANY TIME'));
    s.appendChild(U.svg('path', { d: 'M340 200 L 340 172', class: 'svg-flow' }));
    s.appendChild(U.svg('path', { d: 'M420 172 L 420 200', class: 'svg-flow' }));
    s.appendChild(U.svg('rect', { x: 300, y: 118, width: 160, height: 80, rx: 2, class: 'svg-node-gold' }));
    s.appendChild(U.svg('text', { x: 380, y: 164, 'text-anchor': 'middle', class: 'svg-t-sm' }, 'CORPUS — NOT FIXED'));
    s.appendChild(U.svg('text', { x: 380, y: 100, 'text-anchor': 'middle', class: 'svg-t-sm' }, 'NO LID'));

    var iLid = U.svg('rect', { x: 546, y: 66, width: 180, height: 14, rx: 2, class: 'svg-node-gold' });
    s.appendChild(iLid);
    s.appendChild(U.svg('rect', { x: 556, y: 118, width: 160, height: 80, rx: 2, class: 'svg-node-gold' }));
    var iTxt = U.svg('text', { x: 636, y: 164, 'text-anchor': 'middle', class: 'svg-t-sm' }, '');
    s.appendChild(iTxt);

    /* timeline strip */
    s.appendChild(U.svg('line', { x1: 24, x2: 736, y1: 268, y2: 268, stroke: '#3a342c', 'stroke-width': '1.2' }));
    var head = U.svg('circle', { cx: 60, cy: 268, r: 5, fill: '#e5c88a' });
    s.appendChild(head);
    var phaseT = U.svg('text', { x: 24, y: 290, class: 'svg-t-sm' }, '');
    s.appendChild(phaseT);
    WINDOWS.forEach(function (w) {
      s.appendChild(U.svg('line', {
        x1: 24 + w[0] * 712, x2: 24 + w[1] * 712, y1: 276, y2: 276, stroke: '#9cb37a', 'stroke-width': '3'
      }));
    });

    wrap.appendChild(s);

    function render() {
      var T = st.time;
      head.setAttribute('cx', String(24 + T * 712));
      var nfo = T < 0.15, mat = T >= 0.99;
      lid.setAttribute('opacity', nfo ? '0.22' : '1');
      gate.setAttribute('opacity', mat ? '1' : '0.35');
      iTxt.textContent = inWindow(T) ? 'WINDOW OPEN — AT NAV' : 'CLOSED UNTIL NEXT INTERVAL';
      iLid.setAttribute('opacity', inWindow(T) ? '0.25' : '1');
      phaseT.textContent = (nfo ? 'OFFER PERIOD' : mat ? 'MATURITY — VALUE OF THE UNIT IS PAID' : 'LIFE OF THE FUND');
      Object.keys(reg).forEach(function (k) {
        reg[k].forEach(function (n) { n.classList.toggle('hi', st.hi === k); });
      });
    }
    render();
    return { node: wrap, refresh: render, step: function () { render(); } };
  }

  root.MF3D.defC = {
    id: 'corpus',
    mount: '#mount-scene-c',
    kick: 'Scene C',
    title: 'Open vs closed — one structural fact, six rows',
    hot: true,
    state: { time: 0.05, hi: null, pinned: false, manual: false },
    steps: F.narration.corpus.map(function (say, i) {
      return { say: say, dur: STEPS[i].dur, anim: STEPS[i].anim, cam: STEPS[i].cam };
    }),
    gate: {
      misconception: 'swapping the listing row, and writing that a closed-ended investor cannot sell at all before maturity.',
      why3d: 'the six differences are six consequences of one structural fact, visible over a scrubbable life.',
      after: 'rebuild all six rows from one sentence about counters and side doors.'
    },
    build: build, panel: panel, flat: flat
  };
})(window);
