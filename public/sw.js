/**
 * Secure Service Worker for VoicemailAI PWA
 * Implements security-first caching strategy with integrity checks
 * Handles offline functionality and secure data management
 */

const CACHE_NAME = 'voicemailai-v1.0.0';
const CACHE_VERSION = '1.0.0';

// Define security-approved origins
const ALLOWED_ORIGINS = [
  self.location.origin,
  'https://openrouter.ai',
  'https://api.openrouter.ai',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cal.com',
  'https://api.cal.com'
];

// Critical app files to cache (with integrity)
const CRITICAL_FILES = [
  '/',
  '/mobile-v3',
  '/manifest.json',
  '/_next/static/css/',
  '/_next/static/chunks/',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Files that should never be cached (sensitive data)
const NEVER_CACHE = [
  '/api/agent/chat',
  '/api/transcriptions',
  '/api/user/',
  '/api/checkout',
  '/api/webhook'
];

// Offline fallback content
const OFFLINE_PAGE = '/offline';
const OFFLINE_DATA = {
  message: 'Je bent offline. Sommige functies zijn niet beschikbaar.',
  timestamp: Date.now()
};

/**
 * Security validation for requests
 */
function isRequestSecure(request) {
  try {
    const url = new URL(request.url);
    
    // Check if origin is in allowed list
    if (!ALLOWED_ORIGINS.some(origin => url.origin === origin || url.href.startsWith(origin))) {
      console.warn('SW: Blocked request to unauthorized origin:', url.origin);
      return false;
    }
    
    // Block suspicious request patterns
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /<script/i,
      /on\w+=/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(request.url))) {
      console.warn('SW: Blocked suspicious request pattern:', request.url);
      return false;
    }
    
    // Check for valid HTTP methods
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'];
    if (!allowedMethods.includes(request.method)) {
      console.warn('SW: Blocked unauthorized HTTP method:', request.method);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('SW: Security validation error:', error);
    return false;
  }
}

/**
 * Check if URL should never be cached
 */
function shouldNeverCache(url) {
  return NEVER_CACHE.some(pattern => url.includes(pattern));
}

/**
 * Generate cache key with integrity check
 */
function generateCacheKey(request) {
  const url = new URL(request.url);
  // Remove cache-busting parameters but keep essential ones
  url.searchParams.delete('_t');
  url.searchParams.delete('cache');
  return url.href;
}

/**
 * Validate cached response integrity
 */
async function validateCacheIntegrity(response, url) {
  try {
    // Check if response is valid
    if (!response || !response.ok) {
      return false;
    }
    
    // Check Content-Type for security
    const contentType = response.headers.get('content-type');
    if (contentType) {
      const allowedTypes = [
        'text/html',
        'text/css',
        'application/javascript',
        'application/json',
        'image/',
        'font/',
        'application/manifest+json'
      ];
      
      if (!allowedTypes.some(type => contentType.includes(type))) {
        console.warn('SW: Blocked response with unauthorized content-type:', contentType);
        return false;
      }
    }
    
    // Additional integrity checks for critical files
    if (CRITICAL_FILES.some(file => url.includes(file))) {
      // For now, just validate that response exists and is not empty
      const responseClone = response.clone();
      const text = await responseClone.text();
      if (!text || text.length < 10) {
        console.warn('SW: Critical file appears to be empty or corrupted:', url);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('SW: Cache integrity validation failed:', error);
    return false;
  }
}

/**
 * Secure caching strategy
 */
async function secureCache(request) {
  try {
    // Security validation
    if (!isRequestSecure(request)) {
      return null;
    }
    
    const url = request.url;
    const cacheKey = generateCacheKey(request);
    
    // Check if should never cache
    if (shouldNeverCache(url)) {
      return null;
    }
    
    // Try to get from cache first
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(cacheKey);
    
    if (cachedResponse) {
      // Validate cached response integrity
      const isValid = await validateCacheIntegrity(cachedResponse, url);
      if (isValid) {
        console.log('SW: Serving from cache:', cacheKey);
        return cachedResponse;
      } else {
        // Remove corrupted cache entry
        console.warn('SW: Removing corrupted cache entry:', cacheKey);
        await cache.delete(cacheKey);
      }
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    
    // Validate network response
    const isNetworkValid = await validateCacheIntegrity(networkResponse.clone(), url);
    if (!isNetworkValid) {
      throw new Error('Network response failed integrity check');
    }
    
    // Cache valid network response
    if (networkResponse.ok && networkResponse.status === 200) {
      const responseToCache = networkResponse.clone();
      await cache.put(cacheKey, responseToCache);
      console.log('SW: Cached network response:', cacheKey);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('SW: Secure cache error:', error);
    return null;
  }
}

/**
 * Handle offline scenarios
 */
async function handleOffline(request) {
  const url = new URL(request.url);
  
  // For navigation requests, serve offline page
  if (request.mode === 'navigate') {
    try {
      const cache = await caches.open(CACHE_NAME);
      const offlinePage = await cache.match(OFFLINE_PAGE);
      if (offlinePage) {
        return offlinePage;
      }
    } catch (error) {
      console.error('SW: Could not serve offline page:', error);
    }
    
    // Fallback offline response
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Offline - VoicemailAI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: system-ui, -apple-system, sans-serif; 
            text-align: center; 
            padding: 2rem; 
            background: #f9fafb; 
          }
          .container { 
            max-width: 400px; 
            margin: 0 auto; 
            background: white; 
            padding: 2rem; 
            border-radius: 1rem; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
          }
          .icon { font-size: 3rem; margin-bottom: 1rem; }
          .title { color: #374151; margin-bottom: 0.5rem; }
          .subtitle { color: #6b7280; margin-bottom: 1.5rem; }
          .retry { 
            background: #3b82f6; 
            color: white; 
            border: none; 
            padding: 0.75rem 1.5rem; 
            border-radius: 0.5rem; 
            cursor: pointer; 
            font-size: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">📱</div>
          <h1 class="title">Je bent offline</h1>
          <p class="subtitle">Controleer je internetverbinding en probeer opnieuw.</p>
          <button class="retry" onclick="window.location.reload()">Probeer opnieuw</button>
        </div>
      </body>
      </html>`,
      {
        headers: { 
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
  
  // For API requests, return offline data if available
  if (url.pathname.startsWith('/api/')) {
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'Deze functie is niet beschikbaar offline',
        offline: true,
        timestamp: Date.now()
      }),
      {
        status: 503,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
  
  // For other resources, try cache-only
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
  } catch (error) {
    console.error('SW: Cache access error:', error);
  }
  
  // Final fallback
  return new Response('Resource not available offline', { 
    status: 503,
    headers: { 'Content-Type': 'text/plain' }
  });
}

/**
 * Service Worker Install Event
 */
self.addEventListener('install', (event) => {
  console.log('SW: Installing service worker version', CACHE_VERSION);
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        
        // Pre-cache critical files
        const criticalRequests = CRITICAL_FILES.map(url => {
          return fetch(url).then(response => {
            if (response.ok) {
              return cache.put(url, response);
            }
          }).catch(error => {
            console.warn(`SW: Failed to cache critical file ${url}:`, error);
          });
        });
        
        await Promise.allSettled(criticalRequests);
        console.log('SW: Critical files cached');
        
        // Skip waiting to activate immediately
        self.skipWaiting();
        
      } catch (error) {
        console.error('SW: Install failed:', error);
      }
    })()
  );
});

/**
 * Service Worker Activate Event
 */
self.addEventListener('activate', (event) => {
  console.log('SW: Activating service worker version', CACHE_VERSION);
  
  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
          name.startsWith('voicemailai-') && name !== CACHE_NAME
        );
        
        await Promise.all(
          oldCaches.map(oldCache => {
            console.log('SW: Deleting old cache:', oldCache);
            return caches.delete(oldCache);
          })
        );
        
        // Claim all clients
        await clients.claim();
        console.log('SW: Service worker activated and claimed clients');
        
      } catch (error) {
        console.error('SW: Activation failed:', error);
      }
    })()
  );
});

/**
 * Service Worker Fetch Event
 */
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests for caching (but still apply security)
  if (event.request.method !== 'GET') {
    if (!isRequestSecure(event.request)) {
      event.respondWith(
        new Response('Request blocked by security policy', { status: 403 })
      );
      return;
    }
    return;
  }
  
  event.respondWith(
    (async () => {
      try {
        // Security check
        if (!isRequestSecure(event.request)) {
          return new Response('Request blocked by security policy', { status: 403 });
        }
        
        // Try secure cache strategy
        const cachedResponse = await secureCache(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If cache fails, try network directly
        return await fetch(event.request);
        
      } catch (error) {
        console.error('SW: Fetch error:', error);
        // Handle offline scenarios
        return await handleOffline(event.request);
      }
    })()
  );
});

/**
 * Service Worker Message Event
 */
self.addEventListener('message', (event) => {
  console.log('SW: Received message:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
        
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_VERSION });
        break;
        
      case 'CLEAR_CACHE':
        caches.delete(CACHE_NAME).then(() => {
          event.ports[0].postMessage({ success: true });
        });
        break;
        
      case 'CACHE_STATS':
        caches.open(CACHE_NAME).then(cache => {
          return cache.keys();
        }).then(keys => {
          event.ports[0].postMessage({ 
            cacheSize: keys.length,
            cacheName: CACHE_NAME,
            version: CACHE_VERSION
          });
        });
        break;
        
      default:
        console.warn('SW: Unknown message type:', event.data.type);
    }
  }
});

/**
 * Service Worker Error Event
 */
self.addEventListener('error', (event) => {
  console.error('SW: Service worker error:', event);
});

/**
 * Unhandled Promise Rejection
 */
self.addEventListener('unhandledrejection', (event) => {
  console.error('SW: Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

console.log('SW: Service worker script loaded, version', CACHE_VERSION);