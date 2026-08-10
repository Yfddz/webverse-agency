/* ============================================================================
   MF3D · util — shared helpers for the flat (Lite) views and scene panels.
   Lite mode is a first-class citizen (CLAUDE.md RULE 4), so these get the same
   care as the WebGL code: real SVG, real interaction, same tokens.
   ========================================================================== */
(function (root) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  function svg(tag, attrs, text) {
    var n = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]);
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function svgRoot(vbW, vbH, label) {
    var s = svg('svg', {
      viewBox: '0 0 ' + vbW + ' ' + vbH,
      xmlns: NS, role: 'img', 'aria-label': label
    });
    return s;
  }

  /* Indian digit grouping, matching the page's existing formatter. */
  function inr(n) {
    return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }

  /* An anna-level rupee reading: 52,00,000 → "52 lakh". Used for labels only. */
  function lakh(n) {
    var a = Math.abs(n);
    if (a >= 10000000) return (n / 10000000).toFixed(a % 10000000 ? 2 : 0) + ' crore';
    if (a >= 100000) return (n / 100000).toFixed(a % 100000 ? 2 : 0) + ' lakh';
    return inr(n);
  }

  function chip(text, kind) {
    var s = document.createElement('span');
    s.className = 'mf-chip' + (kind ? ' ' + kind : '');
    s.innerHTML = text;
    return s;
  }

  /* The disclaimer required by CLAUDE.md RULE 1 for anything not in the book. */
  function illustrative(text) {
    return chip('<b>Illustrative</b> — ' + text + ', not textbook data', 'illustrative');
  }

  root.MF3D.util = { svg: svg, svgRoot: svgRoot, inr: inr, lakh: lakh, chip: chip, illustrative: illustrative, NS: NS };
})(window);
