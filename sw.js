const CACHE = 'bvec-56c0ad39d892';
const BASE = self.location.pathname.replace(/\/sw\.js$/, '') || '';
const MD_CACHE = 'bvec-md-56c0ad39d892';

const CODE_EXT = /\.(js|css)$/;
const STATIC_EXT = /\.(jpg|jpeg|png|gif|webp|svg|woff2?|ttf|eot)$/;

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE && k !== MD_CACHE).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;

  // Content manifests and application code change on every publish. Prefer the
  // network so an older service worker cannot hide newly generated cards.
  if (CODE_EXT.test(path)) {
    e.respondWith(networkFirst(e.request, CACHE));
    return;
  }

  if (STATIC_EXT.test(path)) {
    e.respondWith(cacheFirst(e.request, CACHE));
    return;
  }

  if (path.endsWith('.md')) {
    e.respondWith(networkFirst(e.request, MD_CACHE));
    return;
  }

  if (path === BASE + '/' || path === BASE + '/index.html' || path === BASE + '/404.html') {
    e.respondWith(networkFirst(e.request, CACHE));
    return;
  }

  if (path.startsWith(BASE + '/assets/')) {
    e.respondWith(cacheFirst(e.request, CACHE));
  }
});

async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) {
      const cache = await caches.open(cacheName);
      cache.put(req, res.clone());
    }
    return res;
  } catch (e) {
    return new Response('', { status: 503 });
  }
}

async function networkFirst(req, cacheName) {
  try {
    const res = await fetch(req);
    if (res.ok) {
      const cache = await caches.open(cacheName);
      cache.put(req, res.clone());
    }
    return res;
  } catch (e) {
    const cached = await caches.match(req);
    if (cached) return cached;
    return new Response('', { status: 503 });
  }
}
