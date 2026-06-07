/* =========================
   CACHE NAMES
========================= */
const APP_CACHE = "app-shell-v9"; // Incremented version
const QUIZ_CACHE = "quiz-data-v9";
const CDN_CACHE = "cdn-static-v9";

/* =========================
   FILE LISTS
========================= */
const APP_ASSETS = [
  "index.html",
  "js/home.js"
];

const QUIZ_FILES = [];

/* =========================
   INSTALL
   Pre-caches everything immediately
========================= */
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    Promise.all([
      caches.open(APP_CACHE).then(cache => cache.addAll(APP_ASSETS)),
      caches.open(QUIZ_CACHE).then(async (cache) => {
        // We use map + fetch to prevent one 404 from breaking the whole install
        const promises = QUIZ_FILES.map(url => 
          fetch(url)
            .then(response => {
              if (response.ok) return cache.put(url, response);
              throw new Error(`Failed to fetch ${url}`);
            })
            .catch(err => console.warn("Pre-cache warning:", url))
        );
        return Promise.all(promises);
      })
    ])
  );
});

/* =========================
   ACTIVATE
   Cleans up old caches
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
   FETCH STRATEGIES
========================= */
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  /* 1. QUIZ JSON & APP ASSETS (Cache-First) 
     We check cache first because we pre-cached these during install.
  */
  if (url.pathname.endsWith(".json") || APP_ASSETS.some(asset => url.pathname.endsWith(asset.replace('./', '')))) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        
        // If not in cache (e.g. a new file), fetch and save
        return fetch(event.request).then(networkResponse => {
          const clone = networkResponse.clone();
          const targetCache = url.pathname.endsWith(".json") ? QUIZ_CACHE : APP_CACHE;
          caches.open(targetCache).then(cache => cache.put(event.request, clone));
          return networkResponse;
        });
      })
    );
    return;
  }

  /* 2. NAVIGATION (HTML)
     Network-First, falling back to cache if offline.
  */
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(APP_CACHE).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request) || caches.match("./index.html"))
    );
    return;
  }

  /* 3. CDN & STATIC LIBS
     Cache-First with Network Update
  */
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
          caches.open(CDN_CACHE).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  /* 4. DEFAULT (Network with Cache Fallback) */
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
