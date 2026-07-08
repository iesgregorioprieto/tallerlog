// TallerLog Service Worker v2
// Network-first: siempre intenta la red, cache solo como fallback de emergencia
const CACHE = 'tallerlog-v2';

self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  // Borrar todos los caches anteriores
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  // Solo interceptar GET del mismo origen
  if(e.request.method !== 'GET') return;
  if(e.request.url.indexOf(self.location.origin) < 0) return;

  // Siempre red primero — sin cache para el HTML principal
  e.respondWith(
    fetch(e.request, {cache: 'no-store'}).catch(function(){
      return caches.match(e.request);
    })
  );
});
