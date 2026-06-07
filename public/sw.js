const CACHE_NAME = "ne-pervaya-v3";
const DB_NAME = "ne-pervaya";
const DB_VERSION = 1;
const TIMER_STORE = "timers";
const CRAVING_ENDS_AT_KEY = "cravingEndsAt";

let cravingTimerId = null;

const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/offline.html",
];

const NOTIFICATION_OPTIONS = {
  body: "10 минут прошли. Открой приложение и отметь результат.",
  icon: "/icons/icon-192.png",
  badge: "/icons/icon-192.png",
  tag: "craving-timer-complete",
  requireInteraction: true,
  data: { url: "/" },
};

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(TIMER_STORE)) {
        db.createObjectStore(TIMER_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveCravingEndsAt(endsAt) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(TIMER_STORE, "readwrite");
    tx.objectStore(TIMER_STORE).put(endsAt, CRAVING_ENDS_AT_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function getCravingEndsAt() {
  const db = await openDb();
  const value = await new Promise((resolve, reject) => {
    const tx = db.transaction(TIMER_STORE, "readonly");
    const request = tx.objectStore(TIMER_STORE).get(CRAVING_ENDS_AT_KEY);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return typeof value === "number" ? value : null;
}

async function clearCravingEndsAt() {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(TIMER_STORE, "readwrite");
    tx.objectStore(TIMER_STORE).delete(CRAVING_ENDS_AT_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function showCravingCompleteNotification() {
  try {
    await self.registration.showNotification("Не первая", NOTIFICATION_OPTIONS);
  } catch (error) {
    console.warn("[sw] showNotification failed:", error);
  }
}

function clearCravingTimer() {
  if (cravingTimerId) clearTimeout(cravingTimerId);
  cravingTimerId = null;
}

function scheduleCravingNotification(endsAt) {
  clearCravingTimer();

  const tick = async () => {
    let target = endsAt;

    try {
      const stored = await getCravingEndsAt();
      if (typeof stored === "number") {
        target = stored;
      }
    } catch (error) {
      console.warn("[sw] failed to read craving timer:", error);
    }

    const remaining = target - Date.now();

    if (remaining <= 0) {
      clearCravingTimer();
      await showCravingCompleteNotification();
      await clearCravingEndsAt();
      return;
    }

    const nextDelay = Math.min(remaining, 15000);
    cravingTimerId = setTimeout(tick, nextDelay);
  };

  void tick();
}

async function startCravingTimer(endsAt) {
  if (typeof endsAt !== "number" || endsAt <= Date.now()) return;

  await saveCravingEndsAt(endsAt);
  scheduleCravingNotification(endsAt);
}

async function stopCravingTimer() {
  clearCravingTimer();
  await clearCravingEndsAt();
}

async function resumeCravingTimerIfNeeded() {
  const endsAt = await getCravingEndsAt();
  if (!endsAt) return;

  if (endsAt <= Date.now()) {
    await showCravingCompleteNotification();
    await clearCravingEndsAt();
    return;
  }

  scheduleCravingNotification(endsAt);
}

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
    Promise.all([
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key !== CACHE_NAME)
              .map((key) => caches.delete(key))
          )
        ),
      self.clients.claim(),
      resumeCravingTimerIfNeeded(),
    ])
  );
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;

  const run = (promise) => {
    if ("waitUntil" in event && typeof event.waitUntil === "function") {
      event.waitUntil(promise);
      return;
    }
    void promise;
  };

  if (data.type === "CRAVING_TIMER_START") {
    run(startCravingTimer(data.endsAt));
    return;
  }

  if (data.type === "CRAVING_TIMER_CLEAR") {
    run(stopCravingTimer());
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
