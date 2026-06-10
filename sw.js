// Peña Garrucha SW v3.2
const CACHE = 'pena-garrucha-v3-2';

self.addEventListener('install', e=>{
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll([
      '/Futbol-Garrucha-Reserva/',
      '/Futbol-Garrucha-Reserva/index.html',
    ]))
  );
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE).map(k=>{
        console.log('Deleting old cache:',k);
        return caches.delete(k);
      })
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  const url = e.request.url;
  if(url.includes('supabase') ||
     url.includes('index.html') ||
     url.endsWith('/Futbol-Garrucha-Reserva') ||
     url.endsWith('/Futbol-Garrucha-Reserva/')){
    e.respondWith(
      fetch(e.request, {cache:'no-store'}).then(r=>{
        const clone=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request,clone));
        return r;
      }).catch(()=>caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request))
  );
});
