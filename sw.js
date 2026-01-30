const CACHE_NAME = "kk";

// 1. Pre-cache core local assets
// Note: Only include the main CDN entry points here. 
// Sub-files (fonts/modules) will be caught by the fetch handler.
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./maths.html",
  "./circle.html",
  "./graph.html",
  "./triangle.html",
  "./log.html",
  "./trigonometry.html",
  ...Array.from({ length: 41 }, (_, i) => `./${i + 1}.json`),
  "js/graph.js",
  "js/line.js",
  "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js",
  "https://cdn.jsdelivr.net/npm/chart.js",
  "https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@100..900&display=swap"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log("Caching core assets...");
      
      // We still want to be resilient, but we 'await' the process
      const results = await Promise.allSettled(
        CORE_ASSETS.map((url) => 
          fetch(url).then((response) => {
            if (!response.ok) throw new Error(`Failed to fetch ${url}`);
            return cache.put(url, response);
          })
        )
      );

      // Check if critical items failed (Optional)
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        console.warn(`${failed.length} assets failed to cache, but SW installed anyway.`);
      }
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
    if (e.request.method !== "GET") return;
  
    // FIX: Only process http and https requests
    if (!e.request.url.startsWith('http')) return;
  
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
  
        return fetch(e.request).then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Fallback logic could go here
        });
      })
    );
  });
