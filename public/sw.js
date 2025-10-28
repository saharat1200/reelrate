const CACHE_NAME = 'reelrate-v1';
const STATIC_CACHE = 'reelrate-static-v1';
const DYNAMIC_CACHE = 'reelrate-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/offline.html'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.themoviedb\.org/,
  /^https:\/\/api\.jikan\.moe/,
  /^https:\/\/image\.tmdb\.org/,
  /^https:\/\/.*\.supabase\.co/,
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES).catch((error) => {
          console.error('Service Worker: Failed to cache static files:', error);
          // Continue installation even if some files fail to cache
          return Promise.resolve();
        });
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          return fetch(request)
            .then((response) => {
              // Cache successful responses
              if (response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => {
              // Return cached version if network fails
              return cache.match(request);
            });
        })
    );
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Always return fresh response for navigation
          return response;
        })
        .catch(() => {
          // Return cached index.html only when completely offline
          return caches.match('/offline.html') || caches.match('/');
        })
    );
    return;
  }

  // Handle other requests (images, CSS, JS)
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Don't cache HTML pages to prevent stale content
        if (request.url.includes('.html') || 
            request.headers.get('accept')?.includes('text/html')) {
          return response;
        }

        // Cache only static assets (CSS, JS, images)
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Cache the response for static assets only
        const responseToCache = response.clone();
        caches.open(DYNAMIC_CACHE)
          .then((cache) => {
            cache.put(request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // Return cached version only for static assets
        return caches.match(request);
      })
  );
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for pending actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle pending reviews, likes, comments, etc.
  console.log('Background sync triggered');
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  let notificationData = {
    title: 'ReelRate',
    body: 'คุณมีการแจ้งเตือนใหม่',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-72x72.svg',
    data: { url: '/' }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || 'ReelRate',
        body: data.body || 'คุณมีการแจ้งเตือนใหม่',
        icon: data.icon || '/icons/icon-192x192.svg',
        badge: '/icons/icon-72x72.svg',
        vibrate: [200, 100, 200],
        data: {
          url: data.url || '/',
          dateOfArrival: Date.now(),
          primaryKey: data.id || 1
        },
        actions: [
          {
            action: 'view',
            title: 'ดูรายละเอียด',
            icon: '/icons/icon-96x96.svg'
          },
          {
            action: 'dismiss',
            title: 'ปิด',
            icon: '/icons/icon-96x96.svg'
          }
        ]
      };
    } catch (error) {
      console.error('Error parsing push notification data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Default action or 'view' action
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Check if there's already a window/tab open with the target URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no existing window/tab, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event);
  
  // Track notification close events if needed
  // You can send analytics data here
});

// Helper function for background sync
async function handleBackgroundSync() {
  try {
    // Get pending actions from IndexedDB or localStorage
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      try {
        await syncAction(action);
        await removePendingAction(action.id);
      } catch (error) {
        console.error('Failed to sync action:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Placeholder functions for offline data management
async function getPendingActions() {
  // Implementation would get pending actions from storage
  return [];
}

async function syncAction(action) {
  // Implementation would sync the action with the server
  console.log('Syncing action:', action);
}

async function removePendingAction(actionId) {
  // Implementation would remove the action from storage
  console.log('Removing pending action:', actionId);
}