// TallerLog Service Worker
const CACHE = 'tallerlog-v1';
const SHELL = [
  '/tallerlog/',
  '/tallerlog/index.html'
];

// Instalar: cachear el shell
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(SHELL); })
  );
  self.skipWaiting();
});

// Activar: limpiar caches antiguas
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

// Fetch: red primero, caché como fallback
self.addEventListener('fetch', function(e){
  // Solo cachear peticiones GET al propio origen
  if(e.request.method !== 'GET') return;
  if(e.request.url.indexOf(self.location.origin) < 0) return;

  e.respondWith(
    fetch(e.request)
      .then(function(res){
        // Cachear respuesta fresca
        if(res && res.status === 200){
          var clone = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        }
        return res;
      })
      .catch(function(){
        // Sin red: servir desde caché
        return caches.match(e.request).then(function(cached){
          return cached || caches.match('/tallerlog/index.html');
        });
      })
  );
});
