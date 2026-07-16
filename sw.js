const CACHE_NAME = 'bible-study-app-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './index.js',
  './index.css',
  './manifest.json',
  './bible_logo_icon.jpg',
  './data/bible_data.js',
  './data/commentary_db.js'
];

// Install Service Worker and cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell and content');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Fetch event: network falling back to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache new successful dynamic assets if needed
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
