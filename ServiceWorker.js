const CACHE_NAME = "DefaultCompany-Kickoff Rise Trader-1.0.2";

const contentToCache = [
  "Build/KickoffRiseTrader.WebGL.loader.js",
  "Build/KickoffRiseTrader.WebGL.framework.js",
  "Build/KickoffRiseTrader.WebGL.data",
  "Build/KickoffRiseTrader.WebGL.wasm",
  "TemplateData/style.css"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(contentToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
          return Promise.resolve();
        })
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  if (url.hostname.includes("playfabapi.com")) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then(networkResponse => {
        if (!networkResponse || !networkResponse.ok) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache).catch(error => {
            console.warn("[Service Worker] Cache put failed:", error);
          });
        });

        return networkResponse;
      });
    })
  );
});