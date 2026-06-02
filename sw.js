// Peña Garrucha SW v2.7 - 02/06/2026 20:50
const CACHE = 'pena-garrucha-v2-7';
const BUST = '1780433456.745842';

self.addEventListener('install', e=>{
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll([
      '/Futbol-Garrucha-Reserva/',
      '/Futbol-Garrucha-Reserva/index.html',
      '/Futbol-Garrucha-Reserva/manifest.json',
    ]))
  );
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  // Always network-first for the app HTML and Supabase
  if(e.request.url.includes('supabase') || 
     e.request.url.includes('index.html') ||
     e.request.url.endsWith('/')) {
    e.respondWith(
      fetch(e.request).then(r=>{
        const clone=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request,clone));
        return r;
      }).catch(()=>caches.match(e.request))
    );
    return;
  }
  // Cache-first for static assets
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request))
  );
});
