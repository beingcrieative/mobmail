/**
 * Minimale Service Worker voor PWA Install Prompt Compliance
 * Versie: 2025-optimized
 * 
 * Deze service worker is specifiek ontworpen om:
 * 1. PWA install prompt requirements te voldoen
 * 2. GEEN interferentie met authentication flows
 * 3. GEEN caching van kritieke routes
 */

const CACHE_VERSION = 'voicemailai-minimal-v1';
const CACHE_NAME = `${CACHE_VERSION}`;

// Routes die NOOIT gecached mogen worden (kritiek voor authenticatie)
const NEVER_CACHE_ROUTES = [
  '/api/',
  '/login',
  '/register',
  '/auth/',
  '/_next/static/chunks/src_',  // Client-side bundles met auth logic
];

// Minimale static assets die wel veilig gecached kunnen worden
const SAFE_CACHE_ROUTES = [
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/_next/static/css/',
  '/_next/static/media/',
];

/**
 * Install Event - Minimale setup
 */
self.addEventListener('install', (event) => {
  console.log('SW: Installing minimal service worker for PWA compliance');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('SW: Cache opened for minimal static assets');
      // Skip waiting om onmiddellijk actief te worden
      self.skipWaiting();
    })
  );
});

/**
 * Activate Event - Clean up
 */
self.addEventListener('activate', (event) => {
  console.log('SW: Activating minimal service worker');
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients
      clients.claim()
    ])
  );
});

/**
 * Fetch Event - Pass-through strategie voor auth routes
 */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // KRITIEK: Pass-through voor alle auth/API routes
  const shouldNeverCache = NEVER_CACHE_ROUTES.some(route => 
    url.pathname.includes(route)
  );
  
  if (shouldNeverCache) {
    // Direct doorsturen naar netwerk, GEEN cache interferentie
    return; // Laat browser de request natuurlijk afhandelen
  }
  
  // Voor veilige static assets: network-first met fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        // Als netwerk succesvol is, gebruik die response
        if (response && response.status === 200) {
          // Optioneel: cache alleen voor veilige routes
          const shouldCache = SAFE_CACHE_ROUTES.some(route => 
            url.pathname.includes(route)
          );
          
          if (shouldCache) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
        }
        return response;
      })
      .catch(() => {
        // Alleen fallback naar cache voor static assets
        const shouldFallbackToCache = SAFE_CACHE_ROUTES.some(route => 
          url.pathname.includes(route)
        );
        
        if (shouldFallbackToCache) {
          return caches.match(request);
        }
        
        // Voor alle andere routes: fail gracefully
        throw new Error('Network unavailable and no cache available');
      })
  );
});

/**
 * Message Event - Voor communicatie met app
 */
self.addEventListener('message', (event) => {
  const { type, data } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0]?.postMessage({ version: CACHE_VERSION });
      break;
      
    case 'CLEAR_CACHE':
      caches.delete(CACHE_NAME).then(() => {
        event.ports[0]?.postMessage({ success: true });
      });
      break;
      
    default:
      console.log('SW: Unknown message type:', type);
  }
});

/**
 * Error handling
 */
self.addEventListener('error', (event) => {
  console.error('SW: Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('SW: Unhandled promise rejection:', event.reason);
});

console.log('SW: Minimal service worker loaded for PWA compliance');