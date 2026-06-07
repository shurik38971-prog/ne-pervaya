import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

export const CRAVING_NOTIFICATION_ID = 9001;

const NOTIFICATION_TITLE = "Не первая";
const NOTIFICATION_BODY =
  "10 минут прошли. Открой приложение и отметь результат.";

function deliveredKey(endsAt: number) {
  return `craving_notified_${endsAt}`;
}

function markNotificationDelivered(endsAt: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(deliveredKey(endsAt), "1");
}

export function wasNotificationDelivered(endsAt: number) {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(deliveredKey(endsAt)) === "1";
}

export function markCravingBackgrounded() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("craving_was_backgrounded", "1");
}

export function clearCravingBackgrounded() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("craving_was_backgrounded");
}

export function wasCravingBackgrounded() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("craving_was_backgrounded") === "1";
}

function getNotificationIconUrl() {
  if (typeof window === "undefined") return "/icons/icon-192.png";
  return new URL("/icons/icon-192.png", window.location.origin).href;
}

export async function requestCravingNotifications() {
  if (Capacitor.isNativePlatform()) {
    const result = await LocalNotifications.requestPermissions();
    return result.display === "granted";
  }

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

async function showWebCravingNotification() {
  if (typeof window === "undefined") return false;

  const options: NotificationOptions = {
    body: NOTIFICATION_BODY,
    icon: getNotificationIconUrl(),
    badge: getNotificationIconUrl(),
    tag: "craving-timer-complete",
    requireInteraction: true,
  };

  if ("Notification" in window && Notification.permission === "granted") {
    try {
      const notification = new Notification(NOTIFICATION_TITLE, options);
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      return true;
    } catch {
      // Fall through to service worker notification.
    }
  }

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(NOTIFICATION_TITLE, options);
    return true;
  }

  return false;
}

export async function scheduleNativeCravingNotification(endsAt: number) {
  if (!Capacitor.isNativePlatform()) return;

  await LocalNotifications.cancel({
    notifications: [{ id: CRAVING_NOTIFICATION_ID }],
  });

  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== "granted") return;

  await LocalNotifications.schedule({
    notifications: [
      {
        id: CRAVING_NOTIFICATION_ID,
        title: NOTIFICATION_TITLE,
        body: NOTIFICATION_BODY,
        schedule: { at: new Date(endsAt) },
        sound: "default",
        autoCancel: true,
        extra: { type: "craving_timer_complete" },
      },
    ],
  });
}

export async function cancelNativeCravingNotification() {
  if (!Capacitor.isNativePlatform()) return;

  await LocalNotifications.cancel({
    notifications: [{ id: CRAVING_NOTIFICATION_ID }],
  });
}

export async function registerBackgroundTimerCheck() {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  if (!("sync" in registration)) return;

  try {
    await (
      registration as ServiceWorkerRegistration & {
        sync: { register: (tag: string) => Promise<void> };
      }
    ).sync.register("craving-timer-check");
  } catch {
    // Background Sync may be unavailable (iOS, desktop Safari).
  }
}

export async function notifyCravingTimerComplete(endsAt: number | null) {
  if (typeof window === "undefined" || endsAt === null) return;

  if (wasNotificationDelivered(endsAt)) return;

  const shouldNotifyInForeground =
    wasCravingBackgrounded() || document.visibilityState === "hidden";

  if (document.visibilityState === "visible" && !shouldNotifyInForeground) {
    window.focus();
    navigator.vibrate?.([120, 80, 120]);
    return;
  }

  const shown = await showWebCravingNotification();
  if (shown) {
    markNotificationDelivered(endsAt);
  }
}

export function setupNativeNotificationListeners() {
  if (!Capacitor.isNativePlatform()) return () => {};

  const received = LocalNotifications.addListener(
    "localNotificationReceived",
    (notification) => {
      if (notification.id !== CRAVING_NOTIFICATION_ID) return;
      const endsAt = readEndsAtFromNotification(notification);
      if (endsAt) markNotificationDelivered(endsAt);
    }
  );

  const performed = LocalNotifications.addListener(
    "localNotificationActionPerformed",
    () => {
      window.focus();
    }
  );

  return () => {
    void received.then((handle) => handle.remove());
    void performed.then((handle) => handle.remove());
  };
}

function readEndsAtFromNotification(notification: {
  schedule?: { at?: Date | string };
}) {
  const at = notification.schedule?.at;
  if (!at) return null;
  const endsAt = at instanceof Date ? at.getTime() : new Date(at).getTime();
  return Number.isFinite(endsAt) ? endsAt : null;
}
