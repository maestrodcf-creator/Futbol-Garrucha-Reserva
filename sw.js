// Peña Garrucha SW v4.2 — Push + Cache
const CACHE = 'pena-garrucha-v4-5';
const BASE  = 'https://maestrodcf-creator.github.io/Futbol-Garrucha-Reserva';

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
      keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  const u=e.request.url;
  if(u.includes('supabase')){
    e.respondWith(fetch(e.request).catch(()=>new Response('null',{headers:{'Content-Type':'application/json'}})));
    return;
  }
  if(u.endsWith('/Futbol-Garrucha-Reserva')||u.endsWith('/Futbol-Garrucha-Reserva/')||u.includes('index.html')){
    e.respondWith(caches.open(CACHE).then(c=>c.match(e.request).then(r=>{
      var n=fetch(e.request).then(nr=>{c.put(e.request,nr.clone());return nr;});
      return r||n;
    })));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
