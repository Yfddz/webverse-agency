/* =============================================================================
   XII Command Deck — service worker
   Two jobs: keep the deck working offline, and let SENTINEL speak while the
   page is closed (where the browser allows it).
   ============================================================================= */
const VERSION = 'xii-deck-v1';
const SHELL = [
  './', './index.html', './app.css', './app.js', './widget.html',
  './logo.svg', './icon-192.png', './icon-512.png', './favicon-32.png',
  './apple-touch-icon.png', './manifest.webmanifest',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      // Individual failures must not abort the install (fonts, optional assets).
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Navigations: network first so a deploy lands immediately, cache as fallback.
   Everything else: cache first, refreshed in the background. */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;   // let fonts hit the network normally

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});

/* ---------------------------------------------------------------------------
   SENTINEL snapshot. The page can't run while it's closed, so it hands the
   worker everything needed to compose one nudge on its own.
   --------------------------------------------------------------------------- */
let snapshot = null;

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'snapshot') snapshot = e.data.payload;
});

function inQuiet(snap) {
  if (!snap || !snap.quiet) return false;
  const d = new Date();
  const n = d.getHours() * 60 + d.getMinutes();
  const toMin = (s) => { const [h, m] = String(s).split(':').map(Number); return (h || 0) * 60 + (m || 0); };
  const from = toMin(snap.quiet[0]), to = toMin(snap.quiet[1]);
  return from > to ? (n >= from || n < to) : (n >= from && n < to);
}

function speak() {
  if (!snapshot) return Promise.resolve();
  if (inQuiet(snapshot)) return Promise.resolve();
  if (snapshot.studiedToday && !snapshot.alwaysNudge) return Promise.resolve();
  const title = {
    hype: 'Good.', steady: 'Check-in', nudge: 'Nothing logged yet',
    warn: 'The slot is closing', disappoint: 'Day missed', brutal: 'This has gone on long enough',
  }[snapshot.tier] || 'SENTINEL';
  return self.registration.showNotification(title, {
    body: snapshot.line,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: 'sentinel',
    renotify: true,
    data: { url: './' },
  });
}

self.addEventListener('periodicsync', (e) => {
  if (e.tag === 'sentinel-check') e.waitUntil(speak());
});
self.addEventListener('sync', (e) => {
  if (e.tag === 'sentinel-check') e.waitUntil(speak());
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.includes('/deck') && 'focus' in c) return c.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
