const CACHE_NAME = "pwa-v6";
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

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(CORE_ASSETS))
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.map(n => n !== CACHE_NAME && caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;

  // Skip POST, PUT, DELETE, etc.
  if (req.method !== 'GET') {
    return; // just let network handle it
  }

  e.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(req).then(res => {
        return res || fetch(req).then(response => {
          cache.put(req, response.clone());
          return response;
        });
      })
    )
  );
});

