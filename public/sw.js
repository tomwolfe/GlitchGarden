const CACHE_NAME = 'latent-space-zoo-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/globals.css',
  // Next.js chunks will be handled by the browser/Next.js normally,
  // but a basic SW can help with some static assets.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Pass through model requests (handled by transformers.js via separate Cache API)
  if (event.request.url.includes('huggingface.co')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
