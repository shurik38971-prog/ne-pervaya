const CACHE_NAME = "ne-pervaya-v5";
const DB_NAME = "ne-pervaya";
const DB_VERSION = 1;
const TIMER_STORE = "timers";
const CRAVING_ENDS_AT_KEY = "cravingEndsAt";
const CRAVING_TICK_MS = 15000;
const SYNC_TAG = "craving-timer-check";

let cravingTimerId = null;
let cravingTimerGeneration = 0;
let cravingTimerResolve = null;

const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/offline.html",
];

function getNotificationOptions() {
  const origin = self.location.origin;
  return {
    body: "10 минут прошли. Открой приложение и отметь результат.",
    icon: `${origin}/icons/icon-192.png`,
    badge: `${origin}/icons/icon-192.png`,
    tag: "craving-timer-complete",
    renotify: true,
    requireInteraction: true,
    vibrate: [120, 80, 120],
    data: { url: "/" },
  };
}

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
    await self.registration.showNotification(
      "Не первая",
      getNotificationOptions()
    );
  } catch (error) {
    console.warn("[sw] showNotification failed:", error);
  }
}

function clearCravingTimer() {
  if (cravingTimerId) clearTimeout(cravingTimerId);
  cravingTimerId = null;
}

function finishCravingTimerWait() {
  if (cravingTimerResolve) {
    cravingTimerResolve();
    cravingTimerResolve = null;
  }
}

function abortCravingTimerWait() {
  cravingTimerGeneration += 1;
  clearCravingTimer();
  finishCravingTimerWait();
}

async function checkCravingTimerExpired() {
  const endsAt = await getCravingEndsAt();
  if (!endsAt) return false;

  if (endsAt <= Date.now()) {
    abortCravingTimerWait();
    await showCravingCompleteNotification();
    await clearCravingEndsAt();
    return true;
  }

  return false;
}

async function registerNextBackgroundSync() {
  if (!self.registration.sync) return;

  try {
    await self.registration.sync.register(SYNC_TAG);
  } catch (error) {
    console.warn("[sw] background sync register failed:", error);
  }
}

async function handleBackgroundSyncCheck() {
  if (await checkCravingTimerExpired()) return;

  const endsAt = await getCravingEndsAt();
  if (!endsAt) return;

  if (!cravingTimerResolve) {
    await runCravingTimerUntilDone(endsAt);
  }

  await registerNextBackgroundSync();
}

function runCravingTimerUntilDone(endsAt) {
  abortCravingTimerWait();

  const generation = cravingTimerGeneration;

  return new Promise((resolve) => {
    cravingTimerResolve = resolve;

    const tick = async () => {
      if (generation !== cravingTimerGeneration) return;

      let target = endsAt;

      try {
        const stored = await getCravingEndsAt();
        if (stored === null) {
          abortCravingTimerWait();
          return;
        }
        if (typeof stored === "number") {
          target = stored;
        }
      } catch (error) {
        console.warn("[sw] failed to read craving timer:", error);
      }

      if (generation !== cravingTimerGeneration) return;

      const remaining = target - Date.now();

      if (remaining <= 0) {
        clearCravingTimer();
        await showCravingCompleteNotification();
        await clearCravingEndsAt();
        finishCravingTimerWait();
        return;
      }

      cravingTimerId = setTimeout(tick, Math.min(remaining, CRAVING_TICK_MS));
    };

    void tick();
  });
}

async function startCravingTimer(endsAt) {
  if (typeof endsAt !== "number" || endsAt <= Date.now()) return;

  await saveCravingEndsAt(endsAt);
  await registerNextBackgroundSync();
  return runCravingTimerUntilDone(endsAt);
}

async function stopCravingTimer() {
  abortCravingTimerWait();
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

  await registerNextBackgroundSync();
  return runCravingTimerUntilDone(endsAt);
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

self.addEventListener("sync", (event) => {
  if (event.tag !== SYNC_TAG) return;
  event.waitUntil(handleBackgroundSyncCheck());
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;

  const ackPort = data._ackPort;
  const ack = () => {
    if (ackPort && "postMessage" in ackPort) {
      ackPort.postMessage({ ok: true });
    }
  };

  const run = (promise) => {
    if ("waitUntil" in event && typeof event.waitUntil === "function") {
      event.waitUntil(promise);
      return;
    }

    void promise;
  };

  if (data.type === "CRAVING_TIMER_START") {
    ack();
    run(startCravingTimer(data.endsAt));
    return;
  }

  if (data.type === "CRAVING_TIMER_CLEAR") {
    ack();
    run(stopCravingTimer());
    return;
  }

  if (data.type === "CRAVING_REGISTER_SYNC") {
    ack();
    run(registerNextBackgroundSync());
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

  event.waitUntil(
    (async () => {
      if (await checkCravingTimerExpired()) return;
      if (cravingTimerResolve) return;
      await resumeCravingTimerIfNeeded();
    })()
  );

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
