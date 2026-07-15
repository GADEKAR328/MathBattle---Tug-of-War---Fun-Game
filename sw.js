// MathBattle service worker
// Designed & Developed by Yogesh Gadekar
// Minimal pass-through worker that enables "Install App" / add-to-home-screen
// support in Chrome/Edge. Not intended for heavy offline caching.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
