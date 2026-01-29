const CACHE_NAME = "v3";

// 1. Pre-cache core local assets
// Note: Only include the main CDN entry points here. 
// Sub-files (fonts/modules) will be caught by the fetch handler.
const CORE_ASSETS = [
  "./",
  "./index.html",
  ...Array.from({ length: 41 }, (_, i) => `./${i + 1}.json`),
  "js/graph.js",
  "js/line.js",
  "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js",
  "https://cdn.jsdelivr.net/npm/chart.js",
  "https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@100..900&display=swap"
];

// Install: Cache core assets immediately
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // We use map + cache.add instead of addAll so one failed 
      // CDN request doesn't break the whole installation.
      return Promise.allSettled(
        CORE_ASSETS.map((url) => cache.add(url))
      );
    })
  );
});

// Activate: Clean up old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((n) => n !== CACHE_NAME && caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Fetch: Cache-First Strategy (Ideal for libraries like MathJax)
self.addEventListener("fetch", (e) => {
  // We only handle GET requests
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // 1. Return from cache if found
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. Otherwise, fetch from network
      return fetch(e.request).then((networkResponse) => {
        // Check if we received a valid response to cache
        // status 0 is for "opaque" CDN responses
        if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Optional: Return a custom offline page if both fail
      });
    })
  );
});
