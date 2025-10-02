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
  "/riepilogo_business.js",
  "/firma.js",
  "/riepilogo.js",
  "/script.js",
  "/script_business.js",
  "/style.css",
  "/manifest.json",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png",
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
      .catch(() => {
        return new Response("Offline o file non trovato", {
          status: 503,
          statusText: "Service Unavailable",
          headers: { "Content-Type": "text/html" }
        });
      })
  );
});