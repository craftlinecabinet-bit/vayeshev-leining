// Works without a signal. The page and its data come from the network when online (so updates show up),
// and from the saved copy when offline. Fonts and icons come from the saved copy first.
const CACHE = 'vayeshev-v4';
const FILES = ['./', './index.html', './data.json', './Taamey_D.woff2', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  const mine = url.origin === location.origin, font = url.host.startsWith('fonts.g');
  if (!mine && !font) return;   // recordings and everything else go straight to the network
  const fresh = mine && (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('.json') || url.pathname.endsWith('/'));
  e.respondWith(caches.open(CACHE).then(async c => {
    if (fresh) { try { const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r; } catch (err) { return (await c.match(req, { ignoreSearch: true })) || (await c.match('./index.html')); } }
    const hit = await c.match(req, { ignoreSearch: true }); if (hit) return hit;
    const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r;
  }));
});
