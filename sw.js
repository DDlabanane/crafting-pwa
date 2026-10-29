/*
  A Service Worker is a script that the browser runs in the background,
  separate from your web page. It allows the app to work offline
  by intercepting network requests and serving cached files instead.
*/

// The version of your cache.
// IMPORTANT: Whenever you make a big change to CSS/JS/HTML,
// change 'v1' to 'v2' so the phone knows to download the new version.
const CACHE_NAME = 'mc-crafting-v1';

// Because GitHub Pages puts your site in a subfolder, we must
// prefix all our file paths with that folder name.
const BASE_PATH = '/crafting-pwa/';

// This is the list of every file we want to save on the phone for offline use.
const ASSETS = [
  `${BASE_PATH}index.html`,
  `${BASE_PATH}style.css`,
  `${BASE_PATH}app.js`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}data/recipes.json`
];

/* 1. INSTALL EVENT: This runs the first time the user visits the site.
   It opens the cache and downloads all the files in the ASSETS list. */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

/* 2. ACTIVATE EVENT: This runs after a new service worker is installed.
   Its main job is to delete old caches (e.g., deleting 'v1' when 'v2' arrives)
   so the phone doesn't run out of space. */
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

/* 3. FETCH EVENT: This is the most important part.
   Every time the app asks for a file (like a CSS file or the JSON data),
   the service worker intercepts the request. */
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // First, check if we have the file in our cache
    caches.match(event.request).then((response) => {
      // If we found it in the cache, return it immediately (FAST!)
      // If not, go to the internet and fetch it (SLOW)
      return response || fetch(event.request);
    })
  );
});
