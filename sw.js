const CACHE_NAME = "lkjk";

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
  "./gs.html",
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

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith("http")) return;

  // ✅ HANDLE PAGE NAVIGATION (HTML)
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached => {
          const networkFetch = fetch(event.request)
            .then(response => {
              if (response && response.status === 200) {
                cache.put(event.request, response.clone());
              }
              return response;
            })
            .catch(() => cached);

          // ⚡ Serve cached page instantly if exists
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // ✅ HANDLE STATIC FILES (JS, CSS, images)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
          });
        }
        return response;
      });
    })
  );
});
