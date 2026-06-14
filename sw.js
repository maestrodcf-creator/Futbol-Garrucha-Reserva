// Peña Garrucha SW v4.2 — Push + Cache
const CACHE = 'pena-garrucha-v4-4';
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

self.addEventListener('fetch', e=>{
  const url = e.request.url;
  // Supabase API — always network, never cache
  if(url.includes('supabase')){
    e.respondWith(fetch(e.request).catch(()=>new Response('{}',{headers:{'Content-Type':'application/json'}})));
    return;
  }
  // App shell (HTML, icons, fonts) — cache first, update in background
  if(url.endsWith('/Futbol-Garrucha-Reserva')||url.endsWith('/Futbol-Garrucha-Reserva/')||url.includes('index.html')){
    e.respondWith(
      caches.open(CACHE).then(function(cache){
        return cache.match(e.request).then(function(cached){
          var fetchPromise=fetch(e.request).then(function(network){
            cache.put(e.request,network.clone());
            return network;
          });
          // Return cached immediately if available, update in background
          return cached||fetchPromise;
        });
      })
    );
    return;
  }
  // Everything else — cache first
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(function(r){
    if(r.ok) caches.open(CACHE).then(c=>c.put(e.request,r.clone()));
    return r;
  })));
});

self.addEventListener('push', e=>{
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch(err) {}
  
  const title   = data.title || '⚽ Peña Garrucha';
  const options = {
    body:  data.body  || 'Nueva convocatoria disponible',
    icon:  BASE + '/icon-192.png',
    badge: BASE + '/icon-192.png',
    tag:   data.tag   || 'pg-notif',
    data:  { url: data.url || BASE + '/' },
    requireInteraction: false,
    silent: false
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', e=>{
  e.notification.close();
  const url = (e.notification.data||{}).url || BASE + '/';
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(cls=>{
      for(const c of cls){
        if(c.url===url && 'focus' in c) return c.focus();
      }
      if(clients.openWindow) return clients.openWindow(url);
    })
  );
});
