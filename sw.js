// Peña Garrucha SW v3.4 — Push + Cache
const CACHE = 'pena-garrucha-v4-0';

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
  if(url.includes('supabase')||url.includes('index.html')||url.endsWith('/Futbol-Garrucha-Reserva')||url.endsWith('/Futbol-Garrucha-Reserva/')){
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
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title||'Peña Garrucha', {
      body: data.body||'Nueva convocatoria disponible',
      icon: '/Futbol-Garrucha-Reserva/icon-192.png',
      badge: '/Futbol-Garrucha-Reserva/icon-192.png',
      tag: data.tag||'conv',
      data: {url: data.url||'/Futbol-Garrucha-Reserva/'}
    })
  );
});

self.addEventListener('notificationclick', e=>{
  e.notification.close();
  const url = (e.notification.data||{}).url||'/Futbol-Garrucha-Reserva/';
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(cls=>{
      for(var c of cls){ if(c.url===url&&'focus' in c) return c.focus(); }
      if(clients.openWindow) return clients.openWindow(url);
    })
  );
});
