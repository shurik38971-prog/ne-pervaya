const CRAVING_ENDS_AT_KEY = "craving_timer_ends_at";

export function persistCravingEndsAt(endsAt: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CRAVING_ENDS_AT_KEY, String(endsAt));
}

export function readPersistedCravingEndsAt(): number | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(CRAVING_ENDS_AT_KEY);
  if (!raw) return null;

  const endsAt = Number(raw);
  return Number.isFinite(endsAt) ? endsAt : null;
}

export function clearPersistedCravingEndsAt() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CRAVING_ENDS_AT_KEY);
}

export async function requestCravingNotifications() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

async function postToServiceWorker(message: Record<string, unknown>) {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const worker = registration.active ?? navigator.serviceWorker.controller;
  if (!worker) return;

  // MessageChannel keeps the SW alive via waitUntil until the timer promise settles.
  await new Promise<void>((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => resolve();
    channel.port1.onmessageerror = () => resolve();
    worker.postMessage({ ...message, _ackPort: channel.port2 }, [channel.port2]);
    window.setTimeout(resolve, 3000);
  });
}

export async function scheduleCravingTimerInWorker(endsAt: number) {
  if (!("serviceWorker" in navigator)) return;

  persistCravingEndsAt(endsAt);
  await postToServiceWorker({
    type: "CRAVING_TIMER_START",
    endsAt,
  });
}

export async function clearCravingTimerInWorker() {
  if (!("serviceWorker" in navigator)) return;

  clearPersistedCravingEndsAt();
  await postToServiceWorker({ type: "CRAVING_TIMER_CLEAR" });
}

export async function notifyCravingTimerComplete() {
  if (typeof window === "undefined") return;

  if (document.visibilityState === "visible") {
    window.focus();
    navigator.vibrate?.([120, 80, 120]);
    return;
  }

  const title = "Не первая";
  const options: NotificationOptions = {
    body: "10 минут прошли. Открой приложение и отметь результат.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: "craving-timer-complete",
    requireInteraction: true,
  };

  if ("Notification" in window && Notification.permission === "granted") {
    try {
      const notification = new Notification(title, options);
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      return;
    } catch {
      // Fall through to service worker notification.
    }
  }

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, options);
  }
}

export function tryFocusApp() {
  if (typeof window === "undefined") return;
  window.focus();
}

export async function resyncCravingTimerInWorker(endsAt: number | null) {
  if (!endsAt || endsAt <= Date.now()) return;
  await scheduleCravingTimerInWorker(endsAt);
}
