const CACHE_NAME = 'mykiv-cache-v1';
const OFFLINE_PAGE = '/offline';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/register',
  '/offline',
  '/manifest.json',
];

const API_CACHE_PATTERNS = [
  /\/api\/v1\/health\/dashboard/,
  /\/api\/v1\/ai\/chat/,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // API requests - network first, cache fallback
  if (API_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Navigation requests - stale-while-revalidate
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => cached || caches.match(OFFLINE_PAGE));

        return cached || fetchPromise;
      })
    );
    return;
  }

  // Static assets - cache first, network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          if (request.destination === 'image') {
            return new Response('', { status: 204 });
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-health-logs') {
    event.waitUntil(syncHealthLogs());
  }
  if (event.tag === 'sync-couple-data') {
    event.waitUntil(syncCoupleData());
  }
});

async function syncHealthLogs() {
  // In a real implementation, this would sync queued data from IndexedDB
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_COMPLETE', tag: 'sync-health-logs' });
  });
}

async function syncCoupleData() {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_COMPLETE', tag: 'sync-couple-data' });
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'MyKiv AI notification',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/icon-192x192.png',
    tag: data.tag || 'mykiv-notification',
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'MyKiv AI', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const { notification } = event;

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      const targetUrl = notification.data?.url || '/dashboard';

      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
