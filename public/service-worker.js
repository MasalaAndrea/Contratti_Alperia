const CACHE_NAME = "pdfapp-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/pagina1.html",
  "/pagina2.html",
  "/pagina3.html",
  "/riepilogo.html",
  "/pagina2_business.html",
  "/pagina3_business.html",
  "/pagina4_business.html",
  "/script_business.js",
  "/firma.js",
  "/riepilogo.js",
  "/script.js",
  "/script_business.js",
  "/style.css",
  "/manifest.json",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png"
  // NON mettere qui url esterni come CDN!
];

// DEBUG: Mostra quale file fallisce la cache!
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
        } catch (e) {
          console.error("Errore cache file:", url, e);
        }
      }
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => {
        return new Response("Offline o file non trovato", {
          status: 503,
          statusText: "Service Unavailable",
          headers: { "Content-Type": "text/html" }
        });
      })
  );
});