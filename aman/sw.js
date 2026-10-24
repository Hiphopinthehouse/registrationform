// Offline shell for the admin app. Data calls to Google (other origin) are never cached here.
const V = 'hhh6-admin-v4';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'logo.png', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  // stale-while-revalidate: open instantly from cache, refresh in background
  e.respondWith(caches.open(V).then(c => c.match(r, {ignoreSearch: true}).then(hit => {
    const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  })));
});
