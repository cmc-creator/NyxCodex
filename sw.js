// ─────────────────────────────────────────────────────────
//  DSH De-escalation Mastery Lab  —  Service Worker
//  Cache strategy:
//    • App shell (HTML, config, images) → cache-first, revalidate
//    • CDN scripts (Tailwind, Firebase, etc.) → stale-while-revalidate
//    • API / Firebase DB calls → network-only (never cache)
// ─────────────────────────────────────────────────────────

const CACHE_VERSION = 'nyxcodex-v10';
const SHELL_CACHE   = `${CACHE_VERSION}-shell`;
const CDN_CACHE     = `${CACHE_VERSION}-cdn`;

// App shell: files we own — always try to keep fresh
const SHELL_ASSETS = [
  '/',
  '/trainer_pro.html',
  '/tenant.config.js',
  '/manifest.json',
  '/dsh.png',
  '/destiny-springs-logo.png',
  '/lab.png',
  '/hazards.png',
  '/microexpressions.png',
  '/success.png',
  '/failure.png',
  '/prof.png',
];

// CDN origins we'll allow to be served stale
const CDN_ORIGINS = [
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net',
  'https://cdnjs.cloudflare.com',
  'https://www.gstatic.com',         // Firebase SDKs
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
];

// Never cache these — always require live network
const NETWORK_ONLY_ORIGINS = [
  'https://dsh-training-lab-default-rtdb.firebaseio.com',
  'https://identitytoolkit.googleapis.com',
  'https://securetoken.googleapis.com',
];

// ── Install: pre-cache the app shell ──────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Shell pre-cache partial failure:', err))
  );
});

// ── Activate: remove old caches ───────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => !k.startsWith(CACHE_VERSION)).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: route requests to the right strategy ───────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Always skip non-GET
  if (request.method !== 'GET') return;

  // Network-only: auth + realtime DB
  if (NETWORK_ONLY_ORIGINS.some(o => request.url.startsWith(o))) return;

  // Network-only: Vercel serverless API routes (/api/*)
  if (url.pathname.startsWith('/api/')) return;

  // CDN assets — stale-while-revalidate
  if (CDN_ORIGINS.some(o => request.url.startsWith(o))) {
    event.respondWith(staleWhileRevalidate(request, CDN_CACHE));
    return;
  }

  // App shell — cache-first, fall back to network, then offline page
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirstWithNetworkRefresh(request));
    return;
  }
});

// ── Strategy: cache-first, background network refresh ─────
async function cacheFirstWithNetworkRefresh(request) {
  const cache  = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);

  const networkFetch = fetch(request).then(response => {
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  return cached || await networkFetch || offlineFallback();
}

// ── Strategy: stale-while-revalidate ─────────────────────
async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkFetch = fetch(request).then(response => {
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  return cached || await networkFetch || offlineFallback();
}

// ── Offline fallback HTML ─────────────────────────────────
function offlineFallback() {
  return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Offline — DSH Training Lab</title>
  <style>
    body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
         background:#0f172a;color:white;font-family:system-ui,sans-serif;text-align:center;padding:2rem}
    h1{font-size:1.75rem;font-weight:900;margin-bottom:.5rem}
    p{color:#94a3b8;font-size:1rem;margin-bottom:2rem}
    button{background:#2563eb;color:white;border:none;padding:.875rem 2rem;border-radius:.75rem;
           font-size:1rem;font-weight:700;cursor:pointer}
  </style>
</head>
<body>
  <div style="font-size:4rem;margin-bottom:1rem">📡</div>
  <h1>You're offline</h1>
  <p>The training platform needs a connection to load.<br>Check your Wi-Fi or cellular data and try again.</p>
  <button onclick="location.reload()">Try again</button>
</body>
</html>`, { headers: { 'Content-Type': 'text/html' } });
}
// ─── Push Notifications ──────────────────────────────────────────────────────
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || 'Training Reminder — Destiny Springs';
  const options = {
    body:     data.body  || 'Your annual de-escalation training is due soon. Tap to complete it.',
    icon:     data.icon  || '/dsh.png',
    badge:    data.badge || '/dsh.png',
    tag:      'training-reminder',
    renotify: false,
    data: { url: data.url || '/' },
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url === target && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});