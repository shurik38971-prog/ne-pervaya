export function requestCravingNotifications() {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  if (Notification.permission === "default") {
    void Notification.requestPermission();
  }
}

export function scheduleCravingTimerInWorker(endsAt: number) {
  if (!("serviceWorker" in navigator)) return;

  const post = (registration: ServiceWorkerRegistration) => {
    registration.active?.postMessage({
      type: "CRAVING_TIMER_START",
      endsAt,
    });
  };

  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "CRAVING_TIMER_START",
      endsAt,
    });
    return;
  }

  void navigator.serviceWorker.ready.then(post);
}

export function clearCravingTimerInWorker() {
  if (!("serviceWorker" in navigator)) return;

  const message = { type: "CRAVING_TIMER_CLEAR" };

  navigator.serviceWorker.controller?.postMessage(message);
  void navigator.serviceWorker.ready.then((registration) => {
    registration.active?.postMessage(message);
  });
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
    const notification = new Notification(title, options);
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    return;
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
