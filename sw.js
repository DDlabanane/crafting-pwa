const CACHE_NAME = 'mc-crafting-v2'; // Bumped version to force refresh
const BASE_PATH = '/crafting-pwa/';

const ASSETS = [
  `${BASE_PATH}index.html`,
  `${BASE_PATH}style.css`,
  `${BASE_PATH}app.js`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}data/recipes.json`
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // If we have it in cache, return it immediately
      if (response) {
        return response;
      }

      // Otherwise, fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Only cache successful responses and images/assets
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Clone the response because it can only be read once
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
