/**
 * Karmaraj PWA Service Worker
 * Provides offline shell caching, audio asset caching, and offline resilience
 */

const CACHE_NAME = "karmaraj-v1-cache";
const STATIC_ASSETS = [
  "/",
  "/favicon.ico",
  "/manifest.json",
  "/audio/effects/habit_plus.mp3",
  "/audio/effects/habit_minus.mp3",
  "/audio/effects/daily_complete.mp3",
  "/audio/effects/todo_complete.mp3",
  "/audio/effects/reward_buy.mp3",
  "/audio/effects/level_up.mp3",
  "/audio/effects/faint.mp3",
  "/audio/effects/loot_drop.mp3",
  "/audio/effects/achievement.mp3",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Continue even if some individual sound files fail to cache
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Do not cache API routes, WebSockets, or SSE streams
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Cache-first for audio effects, images, and static assets
  if (
    url.pathname.startsWith("/audio/") ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Network-first with cache fallback for navigation / pages
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match("/");
        });
      })
  );
});
