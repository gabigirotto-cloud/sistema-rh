const CACHE_NAME = 'sistema-rh-v1';

// Arquivos que ficam salvos offline
const ARQUIVOS_CACHE = [
  '/sistema-rh/',
  '/sistema-rh/index.html',
  '/sistema-rh/manifest.json'
];

// Instala e faz cache dos arquivos principais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ARQUIVOS_CACHE);
    })
  );
  self.skipWaiting();
});

// Limpa caches antigos quando atualiza
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Estratégia: tenta a rede primeiro, cai no cache se offline
self.addEventListener('fetch', event => {
  // Deixa passar requisições externas (Google APIs, etc)
  if (!event.request.url.includes('/sistema-rh/')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Se conseguiu da rede, atualiza o cache
        if (response && response.status === 200) {
          const copia = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, copia);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline: serve do cache
        return caches.match(event.request).then(cached => {
          return cached || caches.match('/sistema-rh/index.html');
        });
      })
  );
});
