/**
 * The BC Cargo & Courier — Production Service Worker
 * 
 * Features:
 * - Pre-caches essential shell routes: /, /offline.html, /rates, /contact
 * - Stale-While-Revalidate for static assets (styles, fonts, images)
 * - Network-first with offline.html fallback for navigation
 * - ZERO caching for API calls (/api/*) or write mutations (POST, PUT, DELETE)
 */

const CACHE_NAME = 'bc-cargo-cache-v2';

const SHELL_ASSETS = [
  '/',
  '/offline.html',
  '/rates',
  '/contact',
  '/manifest.json',
  '/favicon.png',
  '/brand/bc-logo.webp',
  '/og-banner.png'
];

// Install: pre-cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching application shell...');
      return cache.addAll(SHELL_ASSETS).catch((err) => {
        console.warn('[SW] Some assets failed to pre-cache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting legacy cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch dispatcher
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. NEVER cache non-GET requests (POST, PUT, DELETE) or browser extensions
  if (req.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return;
  }

  // 2. NEVER cache /api/* endpoints
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 3. Navigation requests (HTML pages)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          // If valid response, cache a copy for offline
          if (networkRes.ok) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => {
          // Fallback to cache, or offline.html
          return caches.match(req).then((cached) => {
            return cached || caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // 4. Static assets (CSS, JS, Fonts, Images) -> Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      const fetchPromise = fetch(req).then((networkRes) => {
        if (networkRes.ok && networkRes.type === 'basic') {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return networkRes;
      }).catch(() => {
        // Network failed, nothing to do
      });

      return cachedRes || fetchPromise;
    })
  );
});
