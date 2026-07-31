const CACHE_NAME = 'book-codigos-ssma-v3';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

// Instala e já guarda uma cópia completa do app no celular/computador
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// Remove versões antigas do cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estratégia "stale-while-revalidate":
// 1) Mostra IMEDIATAMENTE a cópia salva no aparelho -> funciona mesmo sem internet
//    (todas as fotos e dados já estão dentro do index.html, então não falta nada)
// 2) Ao mesmo tempo, se tiver internet, busca a versão mais nova no GitHub
//    e atualiza a cópia salva silenciosamente
// 3) Na próxima vez que a pessoa abrir o app, já aparece a versão atualizada
//    -> sem precisar reenviar link nem reinstalar nada
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
