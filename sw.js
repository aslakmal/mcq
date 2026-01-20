const CACHE_NAME = "onepage-pwa-v3";
const CORE_ASSETS = ["./", "./index.html"];

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

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(e.request).then(res => {
        return (
          res ||
          fetch(e.request).then(netRes => {
            cache.put(e.request, netRes.clone());
            return netRes;
          })
        );
      })
    )
  );
});
