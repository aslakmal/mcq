/* =========================
   CACHE NAMES
========================= */

const APP_CACHE = "app-shell-v1";
const QUIZ_CACHE = "quiz-data";
const CDN_CACHE = "cdn-static";

/* =========================
   FILE LISTS
========================= */

const APP_ASSETS = [
  "./",
  "./index.html",
  "./maths.html",
  "./circle.html",
  "./graph.html",
  "./triangle.html",
  "./log.html",
  "./trigonometry.html",
  "./gs.html",
  "./js/graph.js",
  "./js/line.js"
];

const QUIZ_FILES = Array.from({ length: 41 }, (_, i) => `./${i + 1}.json`);

/* =========================
   INSTALL
========================= */

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      await caches.open(APP_CACHE).then(c => c.addAll(APP_ASSETS));
      await caches.open(QUIZ_CACHE).then(c => c.addAll(QUIZ_FILES));
    })()
  );
});

/* =========================
   ACTIVATE
========================= */

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (![APP_CACHE, QUIZ_CACHE, CDN_CACHE].includes(k)) {
            return caches.delete(k);
          }
        })
      )
    )
  );
  self.clients.claim();
});

/* =========================
   FETCH
========================= */

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  /* ---------- HTML ---------- */
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(APP_CACHE).then(c => c.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  /* ---------- QUIZ JSON ---------- */
  if (url.pathname.endsWith(".json")) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(QUIZ_CACHE).then(c => c.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  /* ---------- CDN ---------- */
  if (
    url.hostname.includes("cdn.jsdelivr.net") ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com")
  ) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;

        return fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CDN_CACHE).then(c => c.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  /* ---------- JS / CSS ---------- */
  if (
    event.request.destination === "script" ||
    event.request.destination === "style"
  ) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;

        return fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(APP_CACHE).then(c => c.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  /* ---------- DEFAULT ---------- */
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
