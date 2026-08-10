/* ============================================================================
   MF3D · boot — register the four approved scenes and wire the page shortcuts.
   Scenes are listed in BUILD-BRIEF.md; new ones may not be invented without
   passing the pedagogy gate in CLAUDE.md RULE 2.
   ========================================================================== */
(function (root) {
  'use strict';

  function start() {
    var M = root.MF3D;
    M.boot();
    [M.defA, M.defB, M.defC, M.defD].forEach(function (d) {
      if (!d) return;
      try { M.scene(d); } catch (e) {
        /* One broken scene must never take the masterclass down with it. */
        var host = document.querySelector(d.mount);
        if (host) {
          var p = document.createElement('p');
          p.className = 's3d-note warn';
          p.textContent = 'This scene could not start on this device. The rest of the part is unaffected.';
          host.appendChild(p);
        }
      }
    });

    /* V toggles narration, matching the page's own voice bar. */
    document.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      if (e.key === 'v' || e.key === 'V') {
        var b = document.getElementById('vbToggle');
        if (b && !b.disabled) b.click();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})(window);
