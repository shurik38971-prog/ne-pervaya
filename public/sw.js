const CACHE_NAME = "ne-pervaya-v2";
let cravingTimerId = null;
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/offline.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "CRAVING_TIMER_START") {
    if (cravingTimerId) clearTimeout(cravingTimerId);

    const delay = Math.max(0, data.endsAt - Date.now());
    cravingTimerId = setTimeout(() => {
      cravingTimerId = null;
      self.registration.showNotification("Не первая", {
        body: "10 минут прошли. Открой приложение и отметь результат.",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: "craving-timer-complete",
        requireInteraction: true,
        data: { url: "/" },
      });
    }, delay);
  }

  if (data.type === "CRAVING_TIMER_CLEAR") {
    if (cravingTimerId) clearTimeout(cravingTimerId);
    cravingTimerId = null;
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            return client.focus();
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }

        return undefined;
      })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));

          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("/offline.html");
          }

          return caches.match("/");
        });
    })
  );
});
