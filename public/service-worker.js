importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

if (self.workbox) {
  console.log('Workbox initialized in Harmony Service Worker');

  // Precache static assets if manifest is injected
  self.workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  // CacheFirst strategy for audio files (.mp3, .wav, .aac, .flac, .ogg, .m4a or audio destination)
  self.workbox.routing.registerRoute(
    ({ request, url }) =>
      request.destination === 'audio' ||
      /\.(?:mp3|wav|ogg|flac|aac|m4a)$/i.test(url.pathname),
    new self.workbox.strategies.CacheFirst({
      cacheName: 'harmony-audio-cache',
      plugins: [
        new self.workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
        new self.workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // StaleWhileRevalidate for images, fonts, styles, scripts
  self.workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'image' ||
      request.destination === 'font',
    new self.workbox.strategies.StaleWhileRevalidate({
      cacheName: 'harmony-assets-cache',
    })
  );

  // NetworkFirst for HTML navigation fallback
  self.workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new self.workbox.strategies.NetworkFirst({
      cacheName: 'harmony-pages-cache',
      networkTimeoutSeconds: 3,
    })
  );
} else {
  console.warn('Workbox CDN failed to load in service worker.');
}

// Immediate activation
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
