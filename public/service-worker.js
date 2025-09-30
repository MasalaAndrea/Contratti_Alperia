const CACHE_NAME = "pdfapp-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/riepilogo.html",
  "/riepilogo.js",
  "/script.js",
  "/script_business.js",
  "/style.css",
  // Aggiungi qui TUTTI i file JS/CSS/HTML/PDF che vuoi disponibili offline!
  // Anche le librerie CDN, se vuoi
  "https://cdn.jsdelivr.net/npm/pdf-lib/dist/pdf-lib.min.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});