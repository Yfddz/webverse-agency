/* ============================================================================
   MF3D · SceneFrame — the shell every 3D scene lives in.
   ----------------------------------------------------------------------------
   Responsibilities (BUILD-BRIEF Phase 2):
     · lazy mount on approach, full teardown two viewports away
     · dpr cap, WebGL capability check, weak-device auto-detection
     · Lite mode as a first-class 2D experience, global toggle, persisted
     · a step machine shared with the page's Web Speech engine, with a minimum
       dwell and a watchdog so playback can never hang and never fast-forward
     · play / pause / restart / step / recentre / show-flat, keyboard, captions
     · an error boundary — a dead scene degrades to Lite, it never white-screens
   ========================================================================== */
(function (root) {
  'use strict';

  var G = root.MF3D.gl;
  var LS_LITE = 'mf16.lite';
  var scenes = [];
  var active = [];
  var raf = 0;
  var lastT = 0;

  var reducedMotion = false;
  try { reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* older browser */ }

  var isMobile = Math.min(window.innerWidth, window.innerHeight) < 760 ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');

  /* ------------------------------------------------------ capability detect */

  var CAP = (function () {
    var out = { webgl: false, instancing: false, software: false, cores: navigator.hardwareConcurrency || 0, reason: '' };
    try {
      var c = document.createElement('canvas');
      var gl = c.getContext('webgl2');
      var v2 = !!gl;
      if (!gl) gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) { out.reason = 'This browser has no WebGL.'; return out; }
      out.webgl = true;
      out.instancing = v2 || !!gl.getExtension('ANGLE_instanced_arrays');
      if (!out.instancing) out.reason = 'This browser has no instanced rendering.';
      try {
        var dbg = gl.getExtension('WEBGL_debug_renderer_info');
        if (dbg) {
          var r = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '');
          out.renderer = r;
          out.software = /swiftshader|llvmpipe|software|basic render|microsoft basic/i.test(r);
          if (out.software) out.reason = 'This device is rendering WebGL in software.';
        }
      } catch (e2) { /* renderer string is optional */ }
      var lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    } catch (e3) {
      out.reason = 'WebGL could not start.';
    }
    if (!out.reason && out.cores && out.cores <= 4) out.reason = 'This device reports ' + out.cores + ' CPU cores.';
    if (!out.reason && reducedMotion) out.reason = 'Reduced motion is on in your system settings.';
    return out;
  })();

  function autoLite() {
    return !CAP.webgl || !CAP.instancing || CAP.software || (CAP.cores > 0 && CAP.cores <= 4) || reducedMotion;
  }

  var urlForce = (function () {
    var m = /[?&]3d=(on|off)/.exec(location.search);
    return m ? m[1] : null;
  })();

  var liteState = (function () {
    if (urlForce) return urlForce === 'off';
    var stored = null;
    try { stored = localStorage.getItem(LS_LITE); } catch (e) { /* private mode */ }
    if (stored === '1') return true;
    if (stored === '0') return false;
    return autoLite();
  })();

  function setLite(v, remember) {
    liteState = !!v;
    if (remember !== false) { try { localStorage.setItem(LS_LITE, liteState ? '1' : '0'); } catch (e) { /* private mode */ } }
    document.documentElement.classList.toggle('mf-lite', liteState);
    scenes.forEach(function (s) { s.applyMode(); });
    updateToggle();
  }

  var toggleBtn = null;
  function updateToggle() {
    if (!toggleBtn) return;
    toggleBtn.textContent = liteState ? '3D off' : '3D on';
    toggleBtn.classList.toggle('done', !liteState);
    toggleBtn.setAttribute('aria-pressed', String(!liteState));
    toggleBtn.title = liteState
      ? 'Lite mode: every scene shows its flat 2D equivalent. Press L to turn 3D on.'
      : '3D scenes are on. Press L for Lite mode (flat 2D, no WebGL).';
  }

  /* ------------------------------------------------------------ voice bridge */

  function voice() { return root.MFVoice || null; }
  function say(text, onEnd) {
    var v = voice();
    if (!v || !v.speak) { onEnd && onEnd(); return 0; }
    var t0 = Date.now();
    v.speak(text, function () { onEnd && onEnd(Date.now() - t0); });
    return t0;
  }
  function stopVoice(msg) { var v = voice(); if (v && v.hardStop) v.hardStop(msg); }
  function statusMsg(m, live) { var v = voice(); if (v && v.status) v.status(m, live); }

  /* ------------------------------------------------------------------ utils */

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }
  function btn(label, cls, title) {
    var b = el('button', 'btn sm ' + (cls || ''), label);
    b.type = 'button';
    if (title) { b.title = title; b.setAttribute('aria-label', title); }
    return b;
  }

  /* ============================================================== SceneFrame */

  function Scene(def) {
    this.def = def;
    this.id = def.id;
    this.mounted = false;
    this.playing = false;
    this.idx = 0;
    this.stepT = 0;
    this.timer = null;
    this.dead = false;
    this.deadReason = '';
    this.state = def.state ? JSON.parse(JSON.stringify(def.state)) : {};
    this.time = 0;
    this.hot = !!def.hot;
    this.build();
  }

  Scene.prototype.build = function () {
    var self = this, def = this.def;
    var host = document.querySelector(def.mount);
    if (!host) return;
    this.host = host;

    var sec = el('section', 's3d');
    sec.id = 's3d-' + def.id;
    sec.tabIndex = 0;
    sec.setAttribute('role', 'group');
    sec.setAttribute('aria-label', def.title + ' — interactive 3D scene with a flat 2D equivalent');
    this.root = sec;

    var head = el('div', 's3d-head');
    head.appendChild(el('span', 's3d-kick', def.kick));
    head.appendChild(el('span', 's3d-title', def.title));
    this.modeChip = el('span', 's3d-mode', '3D');
    head.appendChild(this.modeChip);
    sec.appendChild(head);

    /* stage */
    this.stage = el('div', 's3d-stage');
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('aria-hidden', 'true');
    this.labelLayer = el('div', 's3d-labels');
    this.stage.appendChild(this.canvas);
    this.bindContextLoss();
    this.stage.appendChild(this.labelLayer);
    this.hint = el('div', 's3d-hint', 'drag to orbit · pinch to zoom');
    this.stage.appendChild(this.hint);
    sec.appendChild(this.stage);

    /* flat (Lite) */
    this.flatWrap = el('div', 's3d-flat');
    sec.appendChild(this.flatWrap);

    /* controls */
    var ctr = el('div', 's3d-controls');
    this.playBtn = btn('&#9654; Play', 's3d-play', 'Play the narrated walkthrough');
    this.prevBtn = btn('&#9666;', 's3d-prev', 'Previous step');
    this.nextBtn = btn('&#9656;', 's3d-next', 'Next step');
    this.restartBtn = btn('&#8634;', 's3d-restart', 'Restart from step 1');
    this.recentreBtn = btn('Recentre', 's3d-recentre', 'Restore the camera framing for this step');
    this.flatBtn = btn('Show flat version', 's3d-flatbtn', 'Swap this scene for its flat 2D equivalent');
    ctr.appendChild(this.playBtn);
    ctr.appendChild(this.prevBtn);
    ctr.appendChild(this.nextBtn);
    ctr.appendChild(this.restartBtn);
    this.rail = el('div', 's3d-track', '<div class="s3d-fill"></div>');
    this.fill = this.rail.firstChild;
    ctr.appendChild(this.rail);
    this.counter = el('span', 's3d-step', '1 / ' + def.steps.length);
    ctr.appendChild(this.counter);
    ctr.appendChild(this.recentreBtn);
    ctr.appendChild(this.flatBtn);
    sec.appendChild(ctr);

    this.cap = el('div', 's3d-cap');
    this.cap.setAttribute('aria-live', 'polite');
    this.cap.textContent = def.steps[0].say;
    sec.appendChild(this.cap);

    /* scene-specific panel — shared by 3D and Lite so interactions never die */
    if (def.panel) {
      this.panel = el('div', 's3d-panel');
      sec.appendChild(this.panel);
    }

    /* narration as readable prose — screen readers and printing (Phase 8) */
    var det = el('details', 's3d-prose');
    var sum = el('summary', null, 'Read this scene as prose');
    det.appendChild(sum);
    var ol = el('ol');
    def.steps.forEach(function (s) { ol.appendChild(el('li', null, s.say)); });
    det.appendChild(ol);
    if (def.gate) {
      det.appendChild(el('p', 's3d-gate', '<b>What this scene fixes:</b> ' + def.gate.misconception));
    }
    sec.appendChild(det);

    host.appendChild(sec);

    /* wiring */
    this.playBtn.addEventListener('click', function () { self.playing ? self.pause('Paused.') : self.play(); });
    this.restartBtn.addEventListener('click', function () { self.restart(); });
    this.prevBtn.addEventListener('click', function () { self.pause(); self.goto(self.idx - 1); });
    this.nextBtn.addEventListener('click', function () { self.pause(); self.goto(self.idx + 1); });
    this.recentreBtn.addEventListener('click', function () { if (self.orbit) { self.orbit.recentre(); self.applyCam(true); } });
    this.flatBtn.addEventListener('click', function () { setLite(!liteState); });
    sec.addEventListener('keydown', function (e) {
      if (e.target !== sec) return;
      if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); self.playing ? self.pause('Paused.') : self.play(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); self.pause(); self.goto(self.idx + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); self.pause(); self.goto(self.idx - 1); }
    });

    /* context handed to the scene author */
    this.ctx = {
      G: G, PAL: G.PAL, geo: G.geometries(), facts: root.MF_FACTS,
      state: this.state, reduced: reducedMotion, mobile: isMobile,
      el: el, btn: btn, narrow: false,
      refresh: function () { self.refreshAll(); },
      setCaption: function (t) { self.cap.textContent = t; },
      goto: function (i) { self.pause(); self.goto(i); },
      isLite: function () { return liteState; }
    };

    if (def.panel) {
      try { this.panelApi = def.panel(this.ctx, this.panel); } catch (e) { /* panel is optional; scene still works */ }
    }
    this.buildFlat();

    /* observers: mount on approach, tear down two viewports away */
    if ('IntersectionObserver' in window) {
      this.ioNear = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) self.mount();
      }, { rootMargin: '120% 0px 120% 0px' });
      this.ioFar = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) self.unmount();
      }, { rootMargin: '200% 0px 200% 0px' });
      /* On screen right now? Off-screen scenes stay mounted but stop drawing. */
      this.ioVis = new IntersectionObserver(function (en) { self.onScreen = en[0].isIntersecting; });
      this.ioNear.observe(sec);
      this.ioFar.observe(sec);
      this.ioVis.observe(sec);
    } else {
      this.onScreen = true;
      this.mount();
    }

    this.applyMode();
  };

  Scene.prototype.buildFlat = function () {
    if (this.flatBuilt) return;
    this.flatBuilt = true;
    try {
      var out = this.def.flat ? this.def.flat(this.ctx) : null;
      if (!out) return;
      if (out.nodeType) { this.flatWrap.appendChild(out); return; }
      this.flatApi = out;
      if (out.node) this.flatWrap.appendChild(out.node);
    } catch (e) {
      this.flatWrap.appendChild(el('p', 's3d-note', 'Flat view unavailable.'));
    }
  };

  Scene.prototype.refreshAll = function () {
    if (this._refreshing) return;
    this._refreshing = true;
    try {
      if (this.impl && this.impl.refresh) { try { this.impl.refresh(); } catch (e) { this.degrade(e); } }
      if (this.flatApi && this.flatApi.refresh) { try { this.flatApi.refresh(); } catch (e2) { /* flat is best-effort */ } }
      if (this.panelApi && this.panelApi.refresh) { try { this.panelApi.refresh(); } catch (e3) { /* idem */ } }
      this.paint(true);
    } finally {
      this._refreshing = false;
    }
  };

  Scene.prototype.use3d = function () { return !liteState && !this.dead; };

  Scene.prototype.applyMode = function () {
    var on = this.use3d();
    this.root.classList.toggle('is-lite', !on);
    this.modeChip.textContent = this.dead ? 'FLAT' : (on ? '3D' : 'LITE');
    this.modeChip.classList.toggle('warn', !!this.dead);
    this.flatBtn.textContent = on ? 'Show flat version' : 'Show 3D version';
    this.recentreBtn.style.display = on ? '' : 'none';
    this.hint.style.display = on ? '' : 'none';
    if (!on) {
      this.teardownGL();
    } else if (this.nearby) {
      this.mount();
    }
    this.goto(this.idx, true);
  };

  /* --------------------------------------------------------- GL lifecycle */

  Scene.prototype.mount = function () {
    this.nearby = true;
    if (this.mounted || !this.use3d()) return;
    var self = this;
    try {
      this.rd = new G.Renderer(this.canvas, { antialias: !isMobile });
      this.labels = new G.Labels(this.labelLayer);
      this.orbit = new G.Orbit(this.rd, this.stage);
      this.ctx.rd = this.rd;
      this.ctx.labels = this.labels;
      this.ctx.orbit = this.orbit;
      this.impl = this.def.build(this.ctx);
      this.mounted = true;
      this.resize();
      if (!this.ro && 'ResizeObserver' in window) {
        this.ro = new ResizeObserver(function () { self.resize(); });
        this.ro.observe(this.stage);
      }
      this.stage.addEventListener('click', this.onClick = function (e) { self.pick(e); });
      this.applyCam(true);
      this.paint(true);
      addActive(this);
    } catch (e) {
      this.degrade(e);
    }
  };

  Scene.prototype.unmount = function () {
    this.nearby = false;
    if (this.playing) this.pause();
    this.teardownGL();
  };

  Scene.prototype.teardownGL = function () {
    if (!this.mounted) return;
    removeActive(this);
    try { if (this.impl && this.impl.dispose) this.impl.dispose(); } catch (e) { /* nothing to salvage */ }
    try { if (this.labels) this.labels.dispose(); } catch (e2) { /* idem */ }
    try { if (this.orbit) this.orbit.dispose(); } catch (e4) { /* idem */ }
    try { if (this.rd) this.rd.dispose(); } catch (e3) { /* idem */ }
    if (this.onClick) { this.stage.removeEventListener('click', this.onClick); this.onClick = null; }
    this.impl = null; this.rd = null; this.labels = null; this.orbit = null;
    this.ctx.rd = null; this.ctx.labels = null; this.ctx.orbit = null;
    this.mounted = false;
    /* The old canvas is holding a deliberately-lost context and would hand it
       straight back on the next mount, so retire it and start clean. */
    this.swapCanvas();
  };

  Scene.prototype.swapCanvas = function () {
    var fresh = document.createElement('canvas');
    fresh.setAttribute('aria-hidden', 'true');
    if (this.canvas && this.canvas.parentNode) this.canvas.parentNode.replaceChild(fresh, this.canvas);
    this.canvas = fresh;
    this.bindContextLoss();
  };

  /* On a phone the GPU process can drop a context at any time — coming back
     from the lock screen, a tab eviction. Rebuild instead of dying. */
  Scene.prototype.bindContextLoss = function () {
    var self = this;
    this.canvas.addEventListener('webglcontextlost', function (e) {
      if (!self.mounted) return;
      e.preventDefault();
      self.teardownGL();
      if (self.nearby && self.use3d()) setTimeout(function () { self.mount(); }, 250);
    });
  };

  Scene.prototype.degrade = function (err) {
    this.dead = true;
    this.deadReason = (err && err.message) || String(err || 'unknown');
    this.teardownGL();
    if (!this.noteEl) {
      this.noteEl = el('div', 's3d-note warn',
        '3D could not run here, so this scene is showing its flat version. Everything below still works. <span class="s3d-why">(' +
        String(this.deadReason).replace(/[<>&]/g, '') + ')</span>');
      this.root.insertBefore(this.noteEl, this.flatWrap);
    }
    this.applyMode();
  };

  Scene.prototype.resize = function () {
    if (!this.mounted) return;
    var r = this.stage.getBoundingClientRect();
    /* On a narrow stage the scene shrinks but the labels do not, so the
       secondary lines are dropped rather than allowed to pile up. */
    var narrow = r.width < 560;
    this.root.classList.toggle('narrow', narrow);
    if (this.ctx.narrow !== narrow) { this.ctx.narrow = narrow; this.applyCam(true); }
    var dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    this.rd.resize(Math.max(1, r.width), Math.max(1, r.height), dpr);
    this.paint(true);
  };

  /* ------------------------------------------------------------ step machine */

  Scene.prototype.applyCam = function (instant) {
    if (!this.orbit) return;
    var cam = this.def.steps[this.idx] && this.def.steps[this.idx].cam;
    if (!cam) return;
    if (this.ctx.narrow) {
      /* A narrow stage already widens the field to keep the sides on screen;
         come in a little so the subject is not left tiny in the middle. */
      var copy = {}, k;
      for (k in cam) if (cam.hasOwnProperty(k)) copy[k] = cam[k];
      copy.dist = cam.dist * 0.86;
      cam = copy;
    }
    this.orbit.set(cam, instant);
  };

  Scene.prototype.goto = function (i, keepT) {
    var n = this.def.steps.length;
    this.idx = Math.max(0, Math.min(n - 1, i));
    if (!keepT) this.stepT = reducedMotion ? 1 : 0;
    var s = this.def.steps[this.idx];
    this.cap.textContent = s.say;
    this.counter.textContent = (this.idx + 1) + ' / ' + n;
    this.fill.style.width = Math.round(((this.idx + 1) / n) * 100) + '%';
    this.prevBtn.disabled = this.idx === 0;
    this.nextBtn.disabled = this.idx === n - 1;
    this.applyCam(false);
    if (this.impl && this.impl.step) { try { this.impl.step(this.idx); } catch (e) { this.degrade(e); } }
    if (this.flatApi && this.flatApi.step) { try { this.flatApi.step(this.idx); } catch (e2) { /* best effort */ } }
    this.paint(true);
  };

  Scene.prototype.play = function () {
    var self = this;
    stopVoice();
    this.playing = true;
    this.playBtn.innerHTML = '&#9632; Pause';
    this.playBtn.classList.add('playing');
    var v = voice();
    if (v && v.VS) { v.VS.mode = 'scene3d'; v.VS.stopAll = function () { self.pause(); }; }
    if (!this.mounted && this.use3d()) this.mount();
    addActive(this);
    this.runStep();
  };

  Scene.prototype.pause = function (msg) {
    this.playing = false;
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    this.playBtn.innerHTML = '&#9654; Play';
    this.playBtn.classList.remove('playing');
    if (msg) statusMsg(msg);
    if (!this.mounted) removeActive(this);
  };

  Scene.prototype.restart = function () {
    var was = this.playing;
    this.pause();
    stopVoice('Scene restarted.');
    this.goto(0);
    if (was) this.play();
  };

  Scene.prototype.runStep = function () {
    var self = this;
    if (!this.playing) return;
    var steps = this.def.steps, s = steps[this.idx];
    this.stepT = reducedMotion ? 1 : 0;
    this.goto(this.idx, true);
    statusMsg('Scene ' + this.def.kick + ' — step ' + (this.idx + 1) + ' of ' + steps.length, true);
    var dwell = s.dur || 6500;
    say(s.say, function (elapsed) {
      if (!self.playing) return;
      /* If the utterance came back instantly there is no working voice on this
         device, so hold the step for its full reading time instead of racing
         through the scene in silence. */
      var wait = (elapsed === undefined || elapsed < 1200) ? Math.max(0, dwell - (elapsed || 0)) : 400;
      self.timer = setTimeout(function () {
        if (!self.playing) return;
        if (self.idx >= steps.length - 1) {
          self.pause();
          statusMsg('Scene finished — ' + self.def.title + '.');
          return;
        }
        self.goto(self.idx + 1);
        self.runStep();
      }, wait);
    });
  };

  /* ------------------------------------------------------------------ picking */

  Scene.prototype.pick = function (e) {
    if (!this.mounted || !this.impl || !this.impl.pick) return;
    var r = this.stage.getBoundingClientRect();
    var ray = this.rd.ray(e.clientX - r.left, e.clientY - r.top);
    try { this.impl.pick(ray); } catch (err) { /* picking is a nicety */ }
  };

  /* -------------------------------------------------------------------- paint */

  Scene.prototype.paint = function (force) {
    if (!this.mounted || !this.rd) return;
    var dt = force ? 0 : this.dt;
    try {
      this.orbit.update(dt);
      if (this.impl && this.impl.frame) this.impl.frame(dt, this.time, this.idx, this.stepT);
      this.rd.render();
      this.labels.update(this.rd);
    } catch (e) {
      this.degrade(e);
    }
  };

  Scene.prototype.tick = function (dt) {
    this.dt = dt;
    this.time += dt;
    var s = this.def.steps[this.idx];
    var span = ((s && s.anim) || 1.6);
    if (reducedMotion) this.stepT = 1;
    else if (this.stepT < 1) this.stepT = Math.min(1, this.stepT + dt / span);
    this.paint(false);
  };

  /* ------------------------------------------------------------- global loop */

  function addActive(s) { if (active.indexOf(s) < 0) active.push(s); startLoop(); }
  function removeActive(s) { var i = active.indexOf(s); if (i >= 0) active.splice(i, 1); }

  function startLoop() {
    if (raf) return;
    lastT = performance.now();
    raf = requestAnimationFrame(loop);
  }

  var hidden = false;
  document.addEventListener('visibilitychange', function () { hidden = document.hidden; });

  function loop(t) {
    raf = 0;
    var dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;
    if (!hidden) {
      for (var i = 0; i < active.length; i++) {
        var s = active[i];
        if (!s.mounted) continue;
        /* Off-screen scenes stop drawing entirely; on-screen ones draw every
           frame. Skipping alternate frames saved little and left the canvas
           showing a stale or empty buffer on some compositors. */
        if (!s.onScreen && !s.playing) continue;
        s.tick(dt);
      }
    }
    if (active.length) raf = requestAnimationFrame(loop);
  }

  /* --------------------------------------------------------------- registry */

  function register(def) {
    if (!document.querySelector(def.mount)) return null;
    var s = new Scene(def);
    scenes.push(s);
    return s;
  }

  /* ------------------------------------------------------------ header toggle */

  function installToggle() {
    var bar = document.querySelector('.voicebar');
    if (!bar) return;
    var wrap = el('span', 's3d-toggle-wrap');
    wrap.appendChild(el('span', 'vb-k s3d-k', 'Scenes'));
    toggleBtn = btn('3D on', 's3d-toggle');
    toggleBtn.addEventListener('click', function () { setLite(!liteState); });
    wrap.appendChild(toggleBtn);
    var st = bar.querySelector('.vb-status');
    bar.insertBefore(wrap, st || null);
    updateToggle();
  }

  /* L toggles Lite mode from anywhere that is not a text field. */
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    if (e.key === 'l' || e.key === 'L') { setLite(!liteState); }
  });

  root.MF3D.scene = register;
  root.MF3D.setLite = setLite;
  root.MF3D.isLite = function () { return liteState; };
  root.MF3D.cap = CAP;
  root.MF3D.reduced = reducedMotion;
  root.MF3D.scenes = scenes;
  root.MF3D.boot = function () {
    document.documentElement.classList.toggle('mf-lite', liteState);
    installToggle();
  };
})(window);
