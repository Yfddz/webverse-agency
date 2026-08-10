/* ============================================================================
   SCENE D — RISK / RETURN / LIQUIDITY SPACE           (BUILD-BRIEF Phase 6)

   PEDAGOGY GATE
   Misconception targeted: students memorise nine fund types as an
     undifferentiated list and cannot say which investor each suits — which is
     exactly what the 8-mark question rewards.
   Why 3D beats a static diagram: there are genuinely three variables (risk,
     return potential, liquidity / lock-in). The 2D scatter had to drop one.
   What the student can do after this that they couldn't before: place any named
     fund type in the space and justify the placement from its definition.

   Positions come from facts.typePositions, which carries
   provenance: 'illustrative' — so the disclaimer chip is mandatory and the
   definitions shown on tap are the verbatim textbook text, never a paraphrase.
   ============================================================================ */
(function (root) {
  'use strict';

  var G = root.MF3D.gl, U = root.MF3D.util;
  var P = G.PAL;
  var F = root.MF_FACTS;

  var SX = 11.0, SY = 7.6, SZ = 8.0;
  function wx(v) { return (v - 0.5) * SX; }
  function wy(v) { return (v - 0.5) * SY; }
  function wz(v) { return (v - 0.5) * SZ; }

  var TYPES = F.typesByYield.map(function (t) {
    var pos = F.typePositions[t.id];
    return { id: t.id, n: t.n, name: t.name, text: t.text, risk: pos.risk, ret: pos.ret, liq: pos.liquidity };
  });

  function bandColour(risk) { return risk < 0.40 ? P.info : risk < 0.75 ? P.gold : P.warn; }

  /* Narration for this scene is app copy — facts.ts carries spoken narration
     only for the pooling, NAV and corpus scenes. Every content-bearing claim
     below is the textbook's own: the stock-fund line is quoted, and the last
     step is facts.typesByYieldTrap in speakable form. */
  var SAY = [
    'Nine types, one space. Left to right is the risk borne by the investor. Upward is return potential. Towards you is liquidity, and away from you is lock-in.',
    'Down in the low corner sit the money market mutual fund and the bonds fund. Low risk, modest return, and the money comes back quickly.',
    'Across the middle band: income-oriented, balanced, and growth-oriented. One verb separates the first two. Growth retains the income; income distributes it as dividend.',
    'Top right: the stock fund and the leverage fund. Both suit an investor who can resist significant risks for higher returns.',
    'Now the third axis, the one a flat map cannot show. Tax relief funds and real estate funds sit far back, because both carry a lock-in. Tap any sphere to read its textbook definition.',
    'Nine, not eight. The chapter summary drops real estate funds. Revise from the main body.'
  ];

  var STEPS = [
    { dur: 8000, anim: 2.6, cam: { tx: 0, ty: 0, tz: 0, dist: 20.0, theta: 0.70, phi: 1.22, fov: 44 } },
    { dur: 7500, anim: 1.8, cam: { tx: -3.2, ty: -2.2, tz: 1.6, dist: 13.5, theta: 0.60, phi: 1.32, fov: 43 } },
    { dur: 9000, anim: 1.8, cam: { tx: 0.2, ty: 0.2, tz: 0.8, dist: 15.0, theta: 0.46, phi: 1.24, fov: 43 } },
    { dur: 8000, anim: 1.8, cam: { tx: 3.8, ty: 2.4, tz: 0.4, dist: 13.0, theta: 0.32, phi: 1.14, fov: 43 } },
    { dur: 10000, anim: 2.4, cam: { tx: 0, ty: 0, tz: 0, dist: 18.5, theta: 1.42, phi: 1.18, fov: 44 } },
    { dur: 8500, anim: 2.0, cam: { tx: 0.4, ty: -0.4, tz: 0, dist: 18.0, theta: 0.64, phi: 1.24, fov: 44 } }
  ];

  function build(ctx) {
    var rd = ctx.rd, g = ctx.geo, L = ctx.labels, st = ctx.state;
    rd.fogRange = [17, 50];

    var mAxis = rd.mesh(g.tube, 64);
    var mGrid = rd.mesh(g.tube, 26, { transparent: true, depthWrite: false });
    var mBall = rd.mesh(g.sphere, TYPES.length + 2);
    var mHalo = rd.mesh(g.sphere, TYPES.length + 2, { transparent: true, depthWrite: false });
    var mDrop = rd.mesh(g.tube, TYPES.length + 2, { transparent: true, depthWrite: false });

    var labs = TYPES.map(function (t, i) {
      var l = L.add(t.name, 'k sm');
      l.off = [0, i % 2 ? 22 : -22];
      l.avoid = true;                 /* de-collide against the other eight */
      return l;
    });
    var axl = {
      x: L.add('RISK BORNE BY THE INVESTOR &#8594;', 'k tick'),
      y: L.add('RETURN POTENTIAL &#8593;', 'k tick vert'),
      z: L.add('&#8592; LOCK-IN &nbsp;&middot;&nbsp; LIQUIDITY &#8594;', 'k tick'),
      lo: L.add('LOW', 'k tick'),
      hi: L.add('HIGH', 'k tick')
    };
    axl.x.off = [0, 30]; axl.y.off = [-26, 0]; axl.z.off = [0, 30];
    axl.lo.off = [0, 14]; axl.hi.off = [0, 14];

    var flatT = 0;

    function frame(dt, time, idx, t) {
      /* the cloud assembles once, on the first step, then stays put */
      st.arrive = idx === 0 ? G.sat(t * 1.25) : 1;
      var target = st.flat ? 1 : 0;
      flatT += (target - flatT) * (1 - Math.exp(-5 * Math.min(dt, 0.1)));
      if (Math.abs(target - flatT) < 0.002) flatT = target;

      var x0 = -SX / 2, y0 = -SY / 2, z0 = -SZ / 2, x1 = SX / 2, y1 = SY / 2, z1 = SZ / 2;

      mAxis.clear(); mGrid.clear();
      mAxis.link([x0, y0, z0], [x1, y0, z0], 0.045, P.borderStrong, 1, 0, 0.35);
      mAxis.link([x0, y0, z0], [x0, y1, z0], 0.045, P.borderStrong, 1, 0, 0.35);
      mAxis.link([x0, y0, z0], [x0, y0, z1], 0.045, P.borderStrong, 1, 0.05, 0.4);
      for (var k = 1; k <= 4; k++) {
        var f = k / 4;
        mAxis.link([G.lerp(x0, x1, f), y0, z0], [G.lerp(x0, x1, f), y0 - 0.22, z0], 0.035, P.border, 1, 0, 0.3);
        mAxis.link([x0, G.lerp(y0, y1, f), z0], [x0 - 0.22, G.lerp(y0, y1, f), z0], 0.035, P.border, 1, 0, 0.3);
      }
      /* floor grid — the depth cue that makes the third axis readable */
      for (var i = 0; i <= 5; i++) {
        var fx = G.lerp(x0, x1, i / 5), fz = G.lerp(z0, z1, i / 5);
        mGrid.link([fx, y0, z0], [fx, y0, G.lerp(z0, z1, 1 - flatT)], 0.02, P.border, 0.5 * (1 - flatT * 0.8), 0, 0.2);
        mGrid.link([x0, y0, fz], [x1, y0, fz], 0.02, P.border, 0.5 * (1 - flatT * 0.8), 0, 0.2);
      }

      mBall.clear(); mHalo.clear(); mDrop.clear();
      for (var n = 0; n < TYPES.length; n++) {
        var ty = TYPES[n];
        var placed = st.quiz ? st.answers[ty.id] : true;
        /* they arrive one after another, and breathe gently once settled */
        var pop = G.back(G.stag(st.arrive, n, TYPES.length, 0.42));
        if (pop <= 0.002) { labs[n].on = false; continue; }
        var bob = Math.sin(time * 0.85 + n * 1.3) * 0.07;
        var px = wx(ty.risk), py = wy(ty.ret) + bob, pz = wz(ty.liq) * (1 - flatT);
        var sel = st.sel === ty.id;
        var hover = st.hover === ty.id;
        var r = 0.46 * pop * (sel ? 1.25 : hover ? 1.12 : 1);
        var col = bandColour(ty.risk);
        var right = st.quiz && st.answers[ty.id] === ty.id;
        var wrong = st.quiz && st.answers[ty.id] && st.answers[ty.id] !== ty.id;
        if (right) col = P.success;
        if (wrong) col = P.warn;
        mBall.push(px, py, pz, r * 2, r * 2, r * 2, 0, 0, 0, col, 1,
          0.06 + 0.35 * (1 - pop) + (sel ? 0.28 : hover ? 0.14 : 0), 0.4 + (sel ? 0.9 : 0), 0.6);
        if (sel || hover) {
          var ping = 1 + Math.sin(time * 3.2) * 0.06;
          mHalo.push(px, py, pz, r * 4.2 * ping, r * 4.2 * ping, r * 4.2 * ping, 0, 0, 0, col, 0.12, 0.3, 1.0, 0.6);
        }
        /* a dropline to the floor, so the eye can read the depth */
        mDrop.link([px, y0, pz], [px, py - r, pz], 0.018, col, 0.45 * pop * (1 - flatT * 0.7), 0.12, 0.3, 0.7);

        var lb = labs[n];
        lb.off[1] = (n % 2 ? 22 : -22);
        /* Nine full names will not fit on a phone. There, each sphere carries
           its roman numeral from the chapter and the tapped one spells itself
           out — the panel below always names it in full. */
        var short = ctx.narrow && !sel && !hover;
        if (lb._short !== short) { lb._short = short; lb._w = 0; }
        lb.on = (!st.quiz || placed);
        lb.p = [px, py + r + (short ? 0.3 : 0.42), pz];
        lb.el.className = 'l3d k sm' + (short ? ' num' : '') + (sel ? ' on' : '') + (right ? ' ok' : '') + (wrong ? ' bad' : '');
        lb.el.innerHTML = st.quiz
          ? (st.answers[ty.id] ? (short ? '?' : nameOf(st.answers[ty.id])) : '')
          : (short ? '(' + ty.n + ')' : ty.name);
      }

      axl.x.p = [0, y0, z1]; axl.x.on = true;
      axl.y.p = [x0, 0, z1]; axl.y.on = true;
      axl.z.p = [x1, y0, 0]; axl.z.on = flatT < 0.5 && !ctx.narrow;
      axl.lo.p = [x0, y0, z1]; axl.lo.on = !ctx.narrow;
      axl.hi.p = [x1, y0, z1]; axl.hi.on = !ctx.narrow;
    }

    function nameOf(id) {
      for (var i = 0; i < TYPES.length; i++) if (TYPES[i].id === id) return TYPES[i].name;
      return '';
    }

    function pick(ray) {
      var best = null, bt = 1e9;
      for (var i = 0; i < TYPES.length; i++) {
        var ty = TYPES[i];
        var p = [wx(ty.risk), wy(ty.ret), wz(ty.liq) * (1 - (st.flat ? 1 : 0))];
        var t = G.hitSphere(ray, p, 0.72);
        if (t >= 0 && t < bt) { bt = t; best = ty.id; }
      }
      if (!best) return;
      if (st.quiz && st.pending) {
        st.answers[best] = st.pending;
        st.pending = null;
      } else {
        st.sel = st.sel === best ? null : best;
      }
      ctx.refresh();
    }

    return { frame: frame, pick: pick, dispose: function () {} };
  }

  /* ---------------------------------------------------------------- panel */

  function panel(ctx, host) {
    var st = ctx.state;

    var row = ctx.el('div', 's3d-row');
    var flatBtn = ctx.btn('Collapse to the flat map', '', 'Drop the liquidity axis and rotate to the 2D view');
    var quizBtn = ctx.btn('Quiz mode', '', 'Hide the names and place them yourself');
    var resetBtn = ctx.btn('Reset', '', 'Clear the quiz');
    row.appendChild(flatBtn); row.appendChild(quizBtn); row.appendChild(resetBtn);
    host.appendChild(row);

    host.appendChild(U.illustrative('the positions are a memory aid built from each type’s stated investor profile'));

    var bank = ctx.el('div', 'd-bank');
    host.appendChild(bank);

    var read = ctx.el('div', 'd-read');
    host.appendChild(read);

    var trap = ctx.el('div', 'callout trap s3d-trap',
      '<span class="callout-label">Summary vs main body</span><p>' + F.typesByYieldTrap + '</p>');
    host.appendChild(trap);

    function score() {
      var right = 0, done = 0;
      TYPES.forEach(function (t) {
        if (st.answers[t.id]) { done++; if (st.answers[t.id] === t.id) right++; }
      });
      return { right: right, done: done };
    }

    function render() {
      flatBtn.classList.toggle('done', !!st.flat);
      flatBtn.textContent = st.flat ? 'Back to three axes' : 'Collapse to the flat map';
      quizBtn.classList.toggle('done', !!st.quiz);
      resetBtn.disabled = !st.quiz;

      bank.innerHTML = '';
      if (st.quiz) {
        var used = {};
        TYPES.forEach(function (t) { if (st.answers[t.id]) used[st.answers[t.id]] = true; });
        var head = ctx.el('div', 'd-bank-head', 'Tap a name, then tap the sphere you think it belongs to.');
        bank.appendChild(head);
        TYPES.forEach(function (t) {
          var c = ctx.el('button', 'd-chip' + (used[t.id] ? ' used' : '') + (st.pending === t.id ? ' arm' : ''), t.name);
          c.type = 'button';
          c.disabled = !!used[t.id];
          c.addEventListener('click', function () {
            st.pending = st.pending === t.id ? null : t.id;
            render();
          });
          bank.appendChild(c);
        });
        var s = score();
        var v = ctx.el('div', 'd-score', s.done + ' of 9 placed · <b>' + s.right + ' correct</b>' +
          (s.done === 9 ? (s.right === 9 ? ' — all nine. You can place any type from its definition.' : ' — the red ones are in the wrong place; tap a sphere to read its definition.') : ''));
        bank.appendChild(v);
      }

      var sel = st.sel && TYPES.filter(function (t) { return t.id === st.sel; })[0];
      if (sel) {
        read.innerHTML = '<div class="d-read-h"><span class="n">(' + sel.n + ')</span>' + sel.name + '</div>' +
          '<p class="d-verb">' + sel.text + '</p>' +
          '<div class="d-coord">risk ' + sel.risk.toFixed(2) + ' · return ' + sel.ret.toFixed(2) + ' · liquidity ' + sel.liq.toFixed(2) +
          ' <i>— illustrative placement, not textbook data</i></div>';
      } else {
        read.innerHTML = '<p class="d-idle">Tap a sphere to read its definition, word for word from the chapter.</p>';
      }
    }

    flatBtn.addEventListener('click', function () {
      st.flat = !st.flat;
      if (ctx.orbit && !ctx.isLite()) {
        ctx.orbit.set(st.flat ? { theta: 0.001, phi: 1.5708, dist: 13.5, tx: 0, ty: 0, tz: 0 } : STEPS[0].cam, false);
      }
      render(); ctx.refresh();
    });
    quizBtn.addEventListener('click', function () {
      st.quiz = !st.quiz;
      st.pending = null;
      if (st.quiz) { st.answers = {}; st.sel = null; }
      render(); ctx.refresh();
    });
    resetBtn.addEventListener('click', function () { st.answers = {}; st.pending = null; render(); ctx.refresh(); });

    render();
    return { refresh: render };
  }

  /* ----------------------------------------------------------------- flat */

  function flat(ctx) {
    var st = ctx.state;
    var wrap = ctx.el('div', 's3d-flatbox');
    var s = U.svgRoot(760, 340, 'Flat risk and return map of the nine fund types, with a separate liquidity strip carrying the third axis');
    s.appendChild(U.svg('text', { x: 8, y: 18, class: 'svg-t-gold' }, 'RISK / RETURN — AND LIQUIDITY AS A SEPARATE STRIP'));
    s.appendChild(U.svg('path', { d: 'M64 250 L 512 250', class: 'svg-line' }));
    s.appendChild(U.svg('path', { d: 'M64 250 L 64 40', class: 'svg-line' }));
    s.appendChild(U.svg('text', { x: 288, y: 274, 'text-anchor': 'middle', class: 'svg-t-sm' }, 'RISK BORNE BY THE INVESTOR →'));
    s.appendChild(U.svg('text', { x: -145, y: 26, transform: 'rotate(-90)', class: 'svg-t-sm' }, 'RETURN POTENTIAL →'));

    var dots = {};
    TYPES.forEach(function (t) {
      var cx = 64 + t.risk * 440, cy = 250 - t.ret * 200;
      var col = t.risk < 0.40 ? '#7ca69a' : t.risk < 0.75 ? '#c9a961' : '#d08770';
      var c = U.svg('circle', { cx: cx, cy: cy, r: 7, fill: col, class: 'f-dot' });
      var tx = U.svg('text', { x: cx + 13, y: cy + 4, class: 'svg-t' }, t.name);
      c.addEventListener('click', function () { st.sel = st.sel === t.id ? null : t.id; ctx.refresh(); });
      tx.addEventListener('click', function () { st.sel = st.sel === t.id ? null : t.id; ctx.refresh(); });
      s.appendChild(c); s.appendChild(tx);
      dots[t.id] = [c, tx];
    });

    /* the axis the flat map has to drop, given back as a strip */
    s.appendChild(U.svg('text', { x: 560, y: 42, class: 'svg-t-gold' }, 'LIQUIDITY / LOCK-IN'));
    var sorted = TYPES.slice().sort(function (a, b) { return b.liq - a.liq; });
    sorted.forEach(function (t, i) {
      var y = 64 + i * 22;
      s.appendChild(U.svg('rect', { x: 560, y: y - 9, width: Math.max(6, t.liq * 170), height: 12, rx: 2, class: 'svg-node-gold' }));
      s.appendChild(U.svg('text', { x: 560, y: y + 18, class: 'svg-t-sm' }, ''));
      var lbl = U.svg('text', { x: 562, y: y + 1, class: 'svg-t-sm' }, t.name.toUpperCase());
      s.appendChild(lbl);
      dots[t.id].push(lbl);
    });
    s.appendChild(U.svg('text', { x: 560, y: 292, class: 'svg-t-sm' }, 'LONGER BAR = EASIER TO GET THE MONEY OUT'));
    s.appendChild(U.svg('text', { x: 8, y: 314, class: 'svg-t-sm' }, 'ILLUSTRATIVE POSITIONING — NOT TEXTBOOK DATA'));

    wrap.appendChild(s);

    function render() {
      Object.keys(dots).forEach(function (k) {
        dots[k].forEach(function (n) { n.classList.toggle('hi', st.sel === k); });
      });
    }
    render();
    return { node: wrap, refresh: render, step: function () {} };
  }

  root.MF3D.defD = {
    id: 'space',
    mount: '#mount-scene-d',
    kick: 'Scene D',
    title: 'Risk, return and lock-in — the nine types in space',
    hot: false,
    state: { sel: null, hover: null, flat: false, quiz: false, answers: {}, pending: null, arrive: 1 },
    steps: SAY.map(function (say, i) {
      return { say: say, dur: STEPS[i].dur, anim: STEPS[i].anim, cam: STEPS[i].cam };
    }),
    gate: {
      misconception: 'holding the nine types as a flat list, with no sense of which investor each one suits.',
      why3d: 'there are genuinely three variables; the flat scatter had to drop liquidity.',
      after: 'place any named type in the space and justify it from the definition.'
    },
    build: build, panel: panel, flat: flat
  };
})(window);
