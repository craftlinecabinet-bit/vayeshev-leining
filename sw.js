// Keeps the app working without a signal: app files from the cache, refreshed in the background.
const CACHE = 'vayeshev-v1';
const FILES = ['./', './index.html', './data.json', './Taamey_D.woff2', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req, { ignoreSearch: true });
    const net = fetch(req).then(r => { if (r && r.ok && (new URL(req.url).origin === location.origin || req.url.includes('fonts.g'))) c.put(req, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
