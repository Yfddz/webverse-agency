/* ============================================================================
   SCENE B — THE NAV VESSEL                            (BUILD-BRIEF Phase 4)

   PEDAGOGY GATE
   Misconception targeted: dividing before subtracting, and treating ₹10 as a
     permanent price. Students memorise the formula without understanding that
     liabilities are a claim on the pool, not on each unit.
   Why 3D beats a static diagram: NAV is a quantity-per-slice. Volume divided
     into slabs makes "subtract first, divide second" spatially obvious and the
     wrong order visibly absurd.
   What the student can do after this that they couldn't before: predict the
     direction NAV moves when any input changes, and explain why, without
     recomputing.

   Two deliberate departures from the brief's wording, both for accuracy:

   1. The brief says "a measuring rule reads the height of one slab = NAV"
      while also setting one slab to 1,000 units. Those cannot both be true —
      a slab of 1,000 units is 1,000 NAVs tall. So there are two rules here,
      each labelled with its own scale: the POOL rule reads rupees in the
      scheme, and the PER-UNIT rule reads rupees per unit. Only the per-unit
      height is ever called NAV.
   2. The brief asks for 500 slabs. At a phone's stage height that is a quarter
      of a pixel each and reads as a solid block with moiré. The slab count is
      therefore driven by what is actually legible, and the label always states
      the mapping — "63 slabs · 1 slab = 8,000 units · 5,00,000 units in total".
   ============================================================================ */
(function (root) {
  'use strict';

  var G = root.MF3D.gl, U = root.MF3D.util;
  var P = G.PAL;
  var F = root.MF_FACTS;

  var TANK = { w: 4.4, d: 3.2, h: 5.0, y0: -2.5 };
  var POOL_X = 3.45;          /* rule reading rupees in the scheme */
  var UNIT_X = -3.85;         /* rule reading rupees per unit */
  var UNIT_H = 3.2;

  var RANGE = {
    total: [100000, 100000000],
    liab: [0, 20000000],
    units: [10000, 5000000]
  };

  /* ---------------------------------------------------------------- maths */

  function niceCeil(v) {
    if (v <= 0) return 1;
    var e = Math.pow(10, Math.floor(Math.log10(v)));
    var m = v / e;
    /* A close-fitting ceiling — a 52 lakh pool in a 1 crore vessel looks
       half empty and teaches the wrong thing about how full a scheme is. */
    var steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10], s = 10;
    for (var i = 0; i < steps.length; i++) { if (m <= steps[i]) { s = steps[i]; break; } }
    return s * e;
  }

  function calc(st) {
    var total = st.total, liab = Math.min(st.liab, st.total), units = Math.max(1, st.units);
    var net = total - liab;
    var nav = net / units;
    var axis = niceCeil(total);
    var perSlab = 1000, maxN = st.maxSlabs || 120;
    var n = Math.round(units / perSlab);
    while (n > maxN) { perSlab *= 2; n = Math.round(units / perSlab); }
    if (n < 6) { perSlab = Math.max(1, Math.round(units / 20)); n = Math.max(1, Math.round(units / perSlab)); }
    return {
      total: total, liab: liab, units: units, net: net, nav: nav, axis: axis,
      unitAxis: niceCeil(Math.max(nav * 1.5, 0.01)),
      perSlab: perSlab, nSlab: Math.max(1, n),
      wrongPerUnit: total / units,
      wrongAfter: total / units - liab
    };
  }

  function fmtR(n) { return '₹' + U.inr(n); }

  /* ----------------------------------------------------------------- steps */

  var STEPS = [
    { dur: 7000, anim: 2.2, cam: { tx: 0, ty: 0.1, tz: 0, dist: 13.5, theta: 0.40, phi: 1.36, fov: 42 } },
    { dur: 7500, anim: 2.0, cam: { tx: 0.3, ty: 0.7, tz: 0, dist: 13.0, theta: 0.26, phi: 1.26, fov: 42 } },
    { dur: 6000, anim: 1.8, cam: { tx: 0, ty: 0.2, tz: 0, dist: 13.0, theta: 0.54, phi: 1.32, fov: 42 } },
    { dur: 6500, anim: 2.6, cam: { tx: 0, ty: 0.0, tz: 0, dist: 12.8, theta: 0.32, phi: 1.40, fov: 42 } },
    { dur: 11000, anim: 2.4, cam: { tx: -0.8, ty: 0.0, tz: 0, dist: 13.4, theta: 0.16, phi: 1.44, fov: 42 } }
  ];

  /* ------------------------------------------------------------------- 3D */

  function build(ctx) {
    var rd = ctx.rd, g = ctx.geo, L = ctx.labels, st = ctx.state;
    rd.fogRange = [17, 46];

    var mGlass = rd.mesh(g.box, 6, { transparent: true, depthWrite: false });
    var mEdge = rd.mesh(g.tube, 20);
    var mFill = rd.mesh(g.box, 6, { transparent: true, depthWrite: false });
    var mSlab = rd.mesh(g.box, 180);
    var mLiab = rd.mesh(g.box, 190, { transparent: true, depthWrite: false });
    var mRule = rd.mesh(g.box, 60);
    var mUnit = rd.mesh(g.box, 6);
    var mMark = rd.mesh(g.tube, 16, { transparent: true, depthWrite: false });
    var mDrop = rd.mesh(g.sphereLo, 24, { transparent: true, depthWrite: false });

    var lab = {
      total: L.add('', 'k'),
      liab: L.add('', 'k warn'),
      net: L.add('', 'k gold'),
      slabs: L.add('', 'k sm'),
      unitTop: L.add('', 'k big'),
      unitFoot: L.add('', 'k sm'),
      unitAxis: L.add('', 'k tick'),
      poolFoot: L.add('POOL SCALE', 'k tick'),
      axisTop: L.add('', 'k tick'),
      wrong: L.add('', 'k warn')
    };
    lab.unitTop.off = [0, -14];
    lab.unitFoot.off = [0, 20];
    lab.slabs.off = [0, 26];
    lab.poolFoot.off = [0, 18];

    var W = TANK.w / 2, D = TANK.d / 2, H = TANK.h, Y0 = TANK.y0;
    var navShown = 0;

    function frame(dt, time, idx, t) {
      /* enough slabs to read as slices, never so many that they alias */
      st.maxSlabs = Math.max(18, Math.min(90, Math.round(rd.height / 7)));
      var c = calc(st);
      var a0 = idx === 0 ? t : 1;
      var a1 = idx > 1 ? 1 : idx === 1 ? t : 0;
      var a2 = idx > 2 ? 1 : idx === 2 ? t : 0;
      var a3 = idx > 3 ? 1 : idx === 3 ? t : 0;
      var a4 = idx === 4 ? t : (idx > 4 ? 1 : 0);
      var wrong = !!st.wrong;

      var hTotal = H * (c.total / c.axis);
      var hLiab = H * (c.liab / c.axis);
      var hNet = Math.max(0, hTotal - hLiab);
      var iw = TANK.w - 0.26, id = TANK.d - 0.26;

      /* ---- the vessel ---- */
      mGlass.clear(); mEdge.clear();
      var wall = 0.06;
      mGlass.push(0, Y0 + H / 2, -D, TANK.w, H, wall, 0, 0, 0, P.bg4, 0.17, 0, 0.5);
      mGlass.push(0, Y0 + H / 2, D, TANK.w, H, wall, 0, 0, 0, P.bg4, 0.09, 0, 0.5);
      mGlass.push(-W, Y0 + H / 2, 0, wall, H, TANK.d, 0, 0, 0, P.bg4, 0.12, 0, 0.5);
      mGlass.push(W, Y0 + H / 2, 0, wall, H, TANK.d, 0, 0, 0, P.bg4, 0.12, 0, 0.5);
      mGlass.push(0, Y0, 0, TANK.w, wall, TANK.d, 0, 0, 0, P.bg3, 0.9, 0, 0.4);
      var corners = [[-W, -D], [W, -D], [W, D], [-W, D]];
      for (var e = 0; e < 4; e++) {
        var p0 = corners[e], p1 = corners[(e + 1) % 4];
        mEdge.link([p0[0], Y0, p0[1]], [p0[0], Y0 + H, p0[1]], 0.04, P.borderStrong, 1, 0, 0.4);
        mEdge.link([p0[0], Y0, p0[1]], [p1[0], Y0, p1[1]], 0.04, P.borderStrong, 1, 0, 0.4);
        mEdge.link([p0[0], Y0 + H, p0[1]], [p1[0], Y0 + H, p1[1]], 0.04, P.goldDeep, 1, 0.06, 0.5);
      }

      mFill.clear(); mLiab.clear(); mSlab.clear(); mMark.clear(); mDrop.clear();

      if (!wrong) {
        /* ---- step 1: the pool fills, and the surface settles like liquid ---- */
        var poolH = hTotal * G.easeOut5(a0);
        var wob = idx === 0 ? Math.sin(time * 7.5) * 0.06 * Math.max(0, 1 - t * 1.5) : 0;

        /* ---- step 2: liabilities lift clear of the pool ---- */
        var carve = G.ease(a1);
        var netNow = Math.max(0, poolH - hLiab * carve);
        var slice = a3;

        if (slice < 0.02) {
          if (netNow > 0.002) {
            mFill.push(0, Y0 + netNow / 2, 0, iw, netNow, id, 0, 0, 0,
              G.mixc(P.goldDeep, P.gold, 0.5), 0.62 + 0.14 * a2, 0.05, 0.5);
            mFill.push(0, Y0 + netNow + wob, 0, iw * 1.006, 0.055, id * 1.006, 0, 0, 0,
              P.goldBright, 0.92, 0.32, 0.9);
          }
        } else {
          /* ---- step 4: the net volume divides into equal slabs of units ---- */
          var n = c.nSlab, sh = hNet / n;
          var sweep = G.easeOut(slice);
          var gap = Math.min(sh * 0.26, 0.022);
          for (var s = 0; s < n; s++) {
            var k = G.stag(sweep, s, n, 0.34);
            if (k <= 0.001) continue;
            var kk = G.easeOut(k);
            var frac = s / Math.max(1, n - 1);
            mSlab.push(0, Y0 + sh * (s + 0.5), 0,
              iw * (0.5 + 0.5 * kk), Math.max(0.007, sh - gap), id * (0.5 + 0.5 * kk), 0, 0, 0,
              G.mixc(P.goldDeep, P.goldBright, 0.2 + 0.55 * frac), 1, 0.04 + 0.22 * (1 - kk), 0.35);
          }
          /* the cut sweeping up through the volume */
          if (sweep < 0.999) {
            mFill.push(0, Y0 + hNet * sweep, 0, iw * 1.05, 0.05, id * 1.05, 0, 0, 0,
              P.goldBright, 0.8 * (1 - sweep * 0.5), 0.5, 1.0);
          }
        }

        if (c.liab > 0.0001) {
          if (carve < 0.005) {
            /* still sitting inside the pool, as a claim on it */
            if (a0 > 0.5) {
              mLiab.push(0, Y0 + poolH - hLiab / 2, 0, iw * 1.006, hLiab, id * 1.006, 0, 0, 0,
                P.warn, 0.5 * G.sat((a0 - 0.5) / 0.3), 0.06, 0.5);
            }
          } else {
            var lift = G.back(carve) * 0.85 + G.ease(a2) * 0.2;
            var drift = G.ease(a2) * 3.1;
            mLiab.push(drift, Y0 + netNow + hLiab / 2 + lift, 0,
              iw * (1 - 0.16 * a2), hLiab, id * (1 - 0.16 * a2), 0, 0, 0,
              P.warn, (0.8 - 0.42 * a2) * (1 - a3), 0.1 + 0.12 * (1 - carve), 0.65);
            /* a few drops falling away as it separates */
            if (a1 > 0.15 && a1 < 1) {
              for (var q = 0; q < 5; q++) {
                var u = G.sat((a1 - 0.15 - q * 0.06) * 2.4);
                if (u <= 0 || u >= 1) continue;
                var dsz = 0.13 * (1 - u);
                mDrop.push((q - 2) * 0.5, Y0 + netNow + hLiab + 0.4 - u * 1.6, (G.rnd(q, 3) - 0.5) * 1.4,
                  dsz, dsz, dsz, 0, 0, 0, P.warn, 0.8 * (1 - u), 0.2, 0.5);
              }
            }
          }
        }
      } else {
        /* ---- WRONG ORDER — the whole column, liabilities and all, is sliced
           into units. Every slab carries a red sliver that belongs to somebody
           else. That is the error, made geometric. ---- */
        var n2 = c.nSlab, sh2 = hTotal / n2;
        var liabFrac = c.liab / c.total;
        var gap2 = Math.min(sh2 * 0.26, 0.022);
        var shake = Math.sin(time * 13) * 0.02;
        for (var s2 = 0; s2 < n2; s2++) {
          var body = Math.max(0.006, sh2 - gap2);
          var y2 = Y0 + sh2 * (s2 + 0.5) + (s2 % 2 ? shake : -shake);
          mSlab.push(0, y2 + body * liabFrac / 2, 0, iw, body * (1 - liabFrac), id, 0, 0, 0,
            G.mixc(P.goldDeep, P.gold, 0.35), 1, 0.04, 0.3);
          mLiab.push(0, y2 - body * (1 - liabFrac) / 2, 0, iw * 1.006, Math.max(0.004, body * liabFrac), id * 1.006,
            0, 0, 0, P.warn, 0.95, 0.14, 0.4);
        }
      }

      /* ---- the two rules ---- */
      mRule.clear(); mUnit.clear();
      /* pool rule: rupees held by the scheme */
      mRule.push(POOL_X, Y0 + H / 2, 0, 0.05, H, 0.05, 0, 0, 0, P.borderStrong, 1, 0, 0.3);
      for (var k2 = 0; k2 <= 5; k2++) {
        var ty = Y0 + (H * k2) / 5;
        mRule.push(POOL_X + 0.13, ty, 0, 0.26, 0.035, 0.035, 0, 0, 0,
          k2 === 0 || k2 === 5 ? P.gold : P.border, 1, 0, 0.3);
      }

      /* per-unit rule: rupees per unit — a different scale, labelled as one */
      var showUnit = !wrong && a4 > 0.001;
      if (showUnit) {
        var m4 = G.easeOut(a4);
        mRule.push(UNIT_X, Y0 + UNIT_H / 2, 0, 0.05, UNIT_H, 0.05, 0, 0, 0, P.borderStrong, m4, 0, 0.3);
        for (var k3 = 0; k3 <= 3; k3++) {
          mRule.push(UNIT_X + 0.13, Y0 + (UNIT_H * k3) / 3, 0, 0.24, 0.035, 0.035, 0, 0, 0,
            k3 === 0 || k3 === 3 ? P.gold : P.border, 1, 0, 0.3);
        }
        var uh = Math.max(0.02, UNIT_H * G.sat(c.nav / c.unitAxis)) * m4;
        var breathe = 1 + Math.sin(time * 2.1) * 0.012;
        mUnit.push(UNIT_X - 0.75, Y0 + (uh * breathe) / 2, 0, 1.25, uh * breathe, 1.05, 0, 0, 0,
          P.goldBright, 1, 0.24, 0.85);
        mMark.link([UNIT_X - 1.5, Y0, 0], [UNIT_X - 1.5, Y0 + uh, 0], 0.045, P.goldBright, m4, 0.45, 0.7);
        mMark.link([UNIT_X - 1.62, Y0, 0], [UNIT_X - 1.38, Y0, 0], 0.04, P.goldBright, m4, 0.45, 0.7);
        mMark.link([UNIT_X - 1.62, Y0 + uh, 0], [UNIT_X - 1.38, Y0 + uh, 0], 0.04, P.goldBright, m4, 0.45, 0.7);
        /* bracket one slab on the pool side, so the two scales are connected */
        var shh = hNet / c.nSlab;
        mMark.link([W + 0.3, Y0, 0], [W + 0.3, Y0 + Math.max(shh, 0.02), 0], 0.05, P.goldBright, m4, 0.4, 0.6);
      }

      /* ---- labels ---- */
      var poolTop = Y0 + (wrong ? hTotal : hTotal * G.easeOut5(a0));
      lab.total.on = !wrong ? a0 > 0.2 : true;
      lab.total.p = [0, Math.max(poolTop, Y0 + 0.5) + 0.5, 0];
      lab.total.el.innerHTML = (ctx.mobile ? 'TOTAL VALUE' : 'TOTAL VALUE OF THE SCHEME') +
        '<i>' + fmtR(c.total) + '</i>';

      var carved = a1 > 0.02;
      /* once the pool has been sliced the claim has been dealt with; keeping
         it on screen just adds a label pointing at a sliver */
      lab.liab.on = c.liab > 0 && (wrong || (a0 > 0.5 && a3 < 0.4));
      lab.liab.p = wrong ? [0, Y0 + hTotal + 1.0, 0]
        : carved ? [G.ease(a2) * 3.1, Y0 + Math.max(0, hTotal - hLiab * G.ease(a1)) + hLiab + G.back(G.ease(a1)) * 0.85 + G.ease(a2) * 0.2 + 0.35, 0]
          : [0, Y0 + hTotal - hLiab / 2, D + 0.3];
      lab.liab.el.innerHTML = 'LIABILITIES<i>' + fmtR(c.liab) +
        (wrong ? ' — still inside every unit' : ctx.mobile ? '' : ' — a claim on the pool, not on each unit') + '</i>';

      /* the net figure has done its work by the time the slabs appear */
      lab.net.on = a2 > 0.25 && a4 < 0.3 && !wrong;
      lab.net.p = [-W - 0.95, Y0 + hNet / 2, 0];
      lab.net.el.innerHTML = 'NET ASSETS<i>' + fmtR(c.net) + '</i>';

      lab.slabs.on = a3 > 0.4 || wrong;
      lab.slabs.p = [0, Y0 - 0.15, D];
      lab.slabs.el.innerHTML = ctx.mobile
        ? U.inr(c.nSlab) + ' slabs<i>1 slab = ' + U.inr(c.perSlab) + ' of ' + U.inr(c.units) + ' units</i>'
        : U.inr(c.nSlab) + ' slabs &middot; 1 slab = ' + U.inr(c.perSlab) +
          ' units &middot; ' + U.inr(c.units) + ' units in total';

      /* the NAV number counts up as the unit block rises, then sits exact */
      if (a4 < 1) navShown += (c.nav - navShown) * (1 - Math.exp(-5 * Math.min(dt, 0.1)));
      else navShown = c.nav;
      lab.unitTop.on = showUnit;
      lab.unitTop.p = [UNIT_X - 0.75, Y0 + Math.max(0.02, UNIT_H * G.sat(c.nav / c.unitAxis)) * G.easeOut(a4), 0];
      lab.unitTop.el.innerHTML = 'NAV = &#8377;' + navShown.toFixed(2) + '<i>per unit</i>';
      lab.unitFoot.on = showUnit;
      lab.unitFoot.p = [UNIT_X - 0.75, Y0, 0];
      lab.unitFoot.el.innerHTML = 'ONE UNIT<i>per-unit scale, 0 to ' + fmtR(c.unitAxis) + '</i>';
      lab.unitAxis.on = showUnit;
      lab.unitAxis.p = [UNIT_X - 0.75, Y0 + UNIT_H + 0.3, 0];
      lab.unitAxis.el.innerHTML = fmtR(c.unitAxis) + ' / unit';

      lab.poolFoot.on = true; lab.poolFoot.p = [POOL_X + 0.3, Y0, 0];
      lab.axisTop.on = true; lab.axisTop.p = [POOL_X + 0.55, Y0 + H, 0];
      lab.axisTop.el.innerHTML = fmtR(c.axis);

      lab.wrong.on = wrong;
      lab.wrong.p = [0, Y0 + H + 1.0, 0];
      lab.wrong.el.innerHTML = '&#9888; DIVIDED BEFORE SUBTRACTING<i>this is the mistake, not the method</i>';
    }

    return { frame: frame, dispose: function () {} };
  }

  /* ---------------------------------------------------------------- panel */

  function panel(ctx, host) {
    var st = ctx.state;
    var wrap = ctx.el('div', 'nav-panel');

    var sliders = ctx.el('div', 'nav-sliders');
    var defs = [
      { k: 'total', label: 'Total value of the scheme', unit: '₹' },
      { k: 'liab', label: 'Liabilities', unit: '₹' },
      { k: 'units', label: 'Outstanding units', unit: '' }
    ];
    var inputs = {};
    defs.forEach(function (d) {
      var f = ctx.el('div', 'nav-field');
      var lb = ctx.el('label', null, d.label + ' <b></b>');
      var inp = document.createElement('input');
      inp.type = 'range'; inp.min = '0'; inp.max = '1000'; inp.step = '1';
      inp.setAttribute('aria-label', d.label);
      f.appendChild(lb); f.appendChild(inp);
      sliders.appendChild(f);
      inputs[d.k] = { el: inp, val: lb.querySelector('b') };
      inp.addEventListener('input', function () {
        var r = RANGE[d.k];
        var s = parseFloat(inp.value) / 1000;
        var v;
        if (r[0] <= 0) v = Math.round((r[1] * s * s) / 1000) * 1000;
        else v = Math.round(Math.exp(G.lerp(Math.log(r[0]), Math.log(r[1]), s)) / 1000) * 1000;
        st[d.k] = Math.max(d.k === 'units' ? 1000 : 0, v);
        if (st.liab > st.total) st.liab = st.total;
        render(true);
        ctx.refresh();
      });
    });
    wrap.appendChild(sliders);

    var out = ctx.el('div', 'calc-out nav-out');
    wrap.appendChild(out);

    var row = ctx.el('div', 's3d-row');
    F.navWorked.forEach(function (p) {
      var b = ctx.btn(p.label, '', 'Load ' + p.label + ' from the verified worked figures');
      b.addEventListener('click', function () {
        st.total = p.totalValue; st.liab = p.liabilities; st.units = p.units;
        render(); ctx.refresh();
      });
      row.appendChild(b);
    });
    var wrongBtn = ctx.btn('Wrong order &#9888;', 'nav-wrong', 'Show what happens if you divide before subtracting');
    wrongBtn.addEventListener('click', function () {
      st.wrong = !st.wrong;
      render(); ctx.refresh();
      if (st.wrong) ctx.goto(3);
    });
    row.appendChild(wrongBtn);
    wrap.appendChild(row);
    host.appendChild(wrap);

    function pos(k, v) {
      var r = RANGE[k];
      if (r[0] <= 0) return Math.sqrt(G.sat(v / r[1])) * 1000;
      return G.sat((Math.log(Math.max(v, r[0])) - Math.log(r[0])) / (Math.log(r[1]) - Math.log(r[0]))) * 1000;
    }

    function render(skipSliders) {
      var c = calc(st);
      if (!skipSliders) {
        defs.forEach(function (d) { inputs[d.k].el.value = String(pos(d.k, st[d.k])); });
      }
      inputs.total.val.textContent = fmtR(c.total);
      inputs.liab.val.textContent = fmtR(c.liab);
      inputs.units.val.textContent = U.inr(c.units);

      wrongBtn.classList.toggle('is-wrong', !!st.wrong);
      wrap.classList.toggle('is-wrong', !!st.wrong);

      if (!st.wrong) {
        out.innerHTML =
          '<span class="nav-step">Step 1</span> Net assets = ' + fmtR(c.total) + ' − ' + fmtR(c.liab) +
          ' = <b>' + fmtR(c.net) + '</b><br>' +
          '<span class="nav-step">Step 2</span> NAV = ' + fmtR(c.net) + ' ÷ ' + U.inr(c.units) + ' units' +
          '<span class="big">NAV = ₹' + c.nav.toFixed(2) + ' per unit</span>' +
          '<span class="nav-rule">' + F.nav.order + '</span>';
      } else {
        out.innerHTML =
          '<span class="nav-step w">Wrong 1</span> ' + fmtR(c.total) + ' ÷ ' + U.inr(c.units) + ' units = <b class="w">₹' +
          c.wrongPerUnit.toFixed(2) + '</b> per unit<br>' +
          '<span class="nav-step w">Wrong 2</span> ₹' + c.wrongPerUnit.toFixed(2) + ' − ' + fmtR(c.liab) +
          ' = <b class="w">₹' + c.wrongAfter.toFixed(2) + '</b> per unit' +
          '<span class="big w">This is not a price.</span>' +
          '<span class="nav-rule w">Liabilities are a claim on the pool, not on each unit. ' +
          'Correct answer: ₹' + c.nav.toFixed(2) + ' per unit.</span>';
      }
    }

    render();
    return { refresh: render };
  }

  /* ----------------------------------------------------------------- flat */

  function flat(ctx) {
    var st = ctx.state;
    var wrap = ctx.el('div', 's3d-flatbox');
    var s = U.svgRoot(760, 300, 'Flat diagram of net asset value: total value of the scheme less liabilities gives net assets, divided into equal unit slices');

    var X = 60, W = 150, Y0 = 250, H = 200;
    var gTotal = U.svg('rect', { x: X, y: Y0 - H, width: W, height: H, rx: 2, class: 'svg-node-gold' });
    var gLiab = U.svg('rect', { x: X, y: Y0 - H, width: W, height: 30, rx: 2, class: 'svg-warnfill' });
    var tTotal = U.svg('text', { x: X + W / 2, y: Y0 - H - 12, 'text-anchor': 'middle', class: 'svg-t-gold' }, '');
    var tLiab = U.svg('text', { x: X + W + 12, y: 0, class: 'svg-t-sm' }, '');
    s.appendChild(U.svg('text', { x: 8, y: 18, class: 'svg-t-gold' }, 'THE POOL — SUBTRACT FIRST'));
    s.appendChild(gTotal); s.appendChild(gLiab); s.appendChild(tTotal); s.appendChild(tLiab);

    var X2 = 330;
    var gNet = U.svg('rect', { x: X2, y: Y0 - H, width: W, height: H, rx: 2, class: 'svg-node-gold' });
    var slabG = U.svg('g', {});
    var tNet = U.svg('text', { x: X2 + W / 2, y: Y0 - H - 12, 'text-anchor': 'middle', class: 'svg-t-gold' }, '');
    s.appendChild(gNet); s.appendChild(slabG); s.appendChild(tNet);
    s.appendChild(U.svg('text', { x: X2 + W / 2, y: Y0 + 20, 'text-anchor': 'middle', class: 'svg-t-sm' }, 'THEN DIVIDE'));
    s.appendChild(U.svg('text', { x: X + W / 2, y: Y0 + 20, 'text-anchor': 'middle', class: 'svg-t-sm' }, 'TOTAL VALUE'));

    var X3 = 560;
    s.appendChild(U.svg('rect', { x: X3, y: 90, width: 176, height: 96, rx: 3, class: 'svg-node-gold' }));
    var tNav = U.svg('text', { x: X3 + 88, y: 130, 'text-anchor': 'middle', class: 'svg-t-title' }, '');
    s.appendChild(U.svg('text', { x: X3 + 88, y: 152, 'text-anchor': 'middle', class: 'svg-t-sm' }, 'PER UNIT'));
    var tOrder = U.svg('text', { x: X3 + 88, y: 174, 'text-anchor': 'middle', class: 'svg-t-sm' }, '');
    s.appendChild(tNav); s.appendChild(tOrder);
    s.appendChild(U.svg('path', { d: 'M' + (X2 + W + 6) + ' 138 L ' + (X3 - 8) + ' 138', class: 'svg-flow' }));
    s.appendChild(U.svg('path', { d: 'M' + (X + W + 6) + ' 138 L ' + (X2 - 8) + ' 138', class: 'svg-flow' }));

    var stepNote = U.svg('text', { x: 8, y: 292, class: 'svg-t-sm' }, '');
    s.appendChild(stepNote);
    wrap.appendChild(s);

    var NOTES = [
      'STEP 1 — TOTAL VALUE OF THE SCHEME, EVERY ASSET AT MARKET VALUE',
      'STEP 2 — CARVE OUT THE LIABILITIES OF THE SCHEME',
      'STEP 3 — WHAT REMAINS IS NET ASSETS',
      'STEP 4 — SLICE THAT INTO THE OUTSTANDING UNITS',
      'STEP 5 — THE HEIGHT OF ONE UNIT IS THE NAV'
    ];

    function render() {
      var c = calc(st);
      var hTotal = H * (c.total / c.axis);
      var hLiab = H * (c.liab / c.axis);
      var hNet = Math.max(1, hTotal - hLiab);
      gTotal.setAttribute('y', String(Y0 - hTotal));
      gTotal.setAttribute('height', String(Math.max(1, hTotal)));
      gLiab.setAttribute('y', String(Y0 - hTotal));
      gLiab.setAttribute('height', String(Math.max(0, hLiab)));
      gLiab.setAttribute('opacity', c.liab > 0 ? '1' : '0');
      tTotal.textContent = fmtR(c.total);
      tLiab.setAttribute('y', String(Y0 - hTotal + Math.max(12, hLiab / 2)));
      tLiab.textContent = c.liab > 0 ? 'LESS LIABILITIES ' + fmtR(c.liab) : '';

      gNet.setAttribute('y', String(Y0 - hNet));
      gNet.setAttribute('height', String(hNet));
      tNet.textContent = 'NET ' + fmtR(c.net);

      while (slabG.firstChild) slabG.removeChild(slabG.firstChild);
      var shown = Math.min(28, c.nSlab);
      var sh = hNet / shown;
      for (var i = 1; i < shown; i++) {
        slabG.appendChild(U.svg('line', {
          x1: X2, x2: X2 + W, y1: (Y0 - sh * i).toFixed(1), y2: (Y0 - sh * i).toFixed(1),
          stroke: '#0b0a08', 'stroke-width': '1'
        }));
      }

      if (st.wrong) {
        tNav.textContent = '₹' + c.wrongAfter.toFixed(2);
        tNav.setAttribute('fill', '#d08770');
        tOrder.textContent = 'WRONG ORDER — NOT A PRICE';
        tOrder.setAttribute('fill', '#d08770');
      } else {
        tNav.textContent = 'NAV = ₹' + c.nav.toFixed(2);
        tNav.setAttribute('fill', '#e5c88a');
        tOrder.textContent = 'SUBTRACT FIRST · DIVIDE SECOND';
        tOrder.setAttribute('fill', '#a8a196');
      }
    }

    function step(i) { stepNote.textContent = NOTES[i] || ''; }
    render(); step(0);
    return { node: wrap, refresh: render, step: step };
  }

  root.MF3D.defB = {
    id: 'nav',
    mount: '#mount-scene-b',
    kick: 'Scene B',
    title: 'The NAV vessel',
    hot: false,
    state: {
      total: F.navWorked[0].totalValue,
      liab: F.navWorked[0].liabilities,
      units: F.navWorked[0].units,
      wrong: false, maxSlabs: 120
    },
    steps: F.narration.navVessel.map(function (say, i) {
      return { say: say, dur: STEPS[i].dur, anim: STEPS[i].anim, cam: STEPS[i].cam };
    }),
    gate: {
      misconception: 'dividing before subtracting, and treating ₹10 as a permanent price rather than the initial offer price.',
      why3d: 'NAV is a quantity per slice; dividing a volume into slabs makes the order of operations spatial.',
      after: 'predict which way NAV moves when any input changes, without recomputing.'
    },
    build: build, panel: panel, flat: flat
  };
  root.MF3D.navCalc = calc;
})(window);
