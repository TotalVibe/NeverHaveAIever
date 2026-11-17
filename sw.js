// Minimal service worker: required for Chrome/Android to offer installing the app.
// It does not cache anything, so the game always loads the latest files.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
