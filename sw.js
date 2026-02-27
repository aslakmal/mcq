/* =========================
   CACHE NAMES
========================= */

const APP_CACHE = "app-shell-v1";     // change ONLY when HTML/JS changes
const QUIZ_CACHE = "quiz-data";       // persistent (no version)
const CDN_CACHE = "cdn-static";

/* =========================
   FILE LISTS
========================= */

// App shell (versioned)
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

// ALL quiz JSON files (required for random quiz)
const QUIZ_FILES = Array.from({ length: 41 }, (_, i) => `./${i + 1}.json`);

/* =========================
   INSTALL
========================= */

self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    (async () => {
      // Cache app shell
      const appCache = await caches.open(APP_CACHE);
      await appCache.addAll(APP_ASSETS);

      // Cache ALL quiz files (first install delay is OK)
      const quizCache = await caches.open(QUIZ_CACHE);
      await quizCache.addAll(QUIZ_FILES);
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
        keys.map(key => {
          if (![APP_CACHE, QUIZ_CACHE, CDN_CACHE].includes(key)) {
            return caches.delete(key);
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

  /* ---------- HTML (network-first) ---------- */
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          caches.open(APP_CACHE).then(c =>
            c.put(event.request, res.clone())
          );
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  /* ---------- QUIZ JSON (network-first, per-file update) ---------- */
  if (url.pathname.endsWith(".json")) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          caches.open(QUIZ_CACHE).then(c =>
            c.put(event.request, res.clone())
          );
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  /* ---------- CDN FILES (cache-on-demand) ---------- */
  if (
    url.hostname.includes("cdn.jsdelivr.net") ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com")
  ) {
    event.respondWith(
      caches.match(event.request).then(cached =>
        cached ||
        fetch(event.request).then(res => {
          caches.open(CDN_CACHE).then(c =>
            c.put(event.request, res.clone())
          );
          return res;
        })
      )
    );
    return;
  }

  /* ---------- JS / CSS (stale-while-revalidate) ---------- */
  if (
    event.request.destination === "script" ||
    event.request.destination === "style"
  ) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(res => {
          caches.open(APP_CACHE).then(c =>
            c.put(event.request, res.clone())
          );
          return res;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  /* ---------- DEFAULT ---------- */
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
