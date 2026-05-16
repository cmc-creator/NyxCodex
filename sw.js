// Service worker: self-destruct mode
// Clears all caches and unregisters itself so browsers always get fresh content
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', async () => {
  const keys = await caches.keys();
  await Promise.all(keys.map(k => caches.delete(k)));
  await self.registration.unregister();
});
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
