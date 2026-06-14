// Peña Garrucha SW v4.2 — Push + Cache
const CACHE = 'pena-garrucha-v4-2';
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
  if(url.includes('supabase')||url.includes('index.html')||
     url.endsWith('/Futbol-Garrucha-Reserva')||url.endsWith('/Futbol-Garrucha-Reserva/')){
    e.respondWith(
      fetch(e.request,{cache:'no-store'}).then(r=>{
        const clone=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request,clone));
        return r;
      }).catch(()=>caches.match(e.request))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
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
