try {
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');
} catch (e) {
  console.warn('Offline or CDN blocked workbox-sw.js import:', e);
}

if (self.workbox) {
  console.log('Workbox initialized in Harmony Service Worker');

  // Precache static assets if manifest is injected
  self.workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  // CacheFirst strategy for audio files (.mp3, .wav, .aac, .flac, .ogg, .m4a)
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
  console.warn('Workbox CDN unavailable; falling back to native service worker caching.');
}

// Native Fetch Event Handler (Guarantees Chrome Mobile PWA Install Criteria check)
self.addEventListener('fetch', (event) => {
  if (self.workbox) {
    // Workbox handles routing
    return;
  }
  // Fallback network-first handler if workbox didn't load
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request) || caches.match('/');
      })
    );
  }
});

// Immediate activation
self.addEventListener('install', (event) => {
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
