import {
  cancelNativeCravingNotification,
  registerBackgroundTimerCheck,
  scheduleNativeCravingNotification,
} from "@/lib/craving-notifications";

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

async function postToServiceWorker(message: Record<string, unknown>) {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const worker = registration.active ?? navigator.serviceWorker.controller;
  if (!worker) return;

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
  await scheduleNativeCravingNotification(endsAt);
  await registerBackgroundTimerCheck();
  await postToServiceWorker({
    type: "CRAVING_TIMER_START",
    endsAt,
  });
}

export async function clearCravingTimerInWorker() {
  if (!("serviceWorker" in navigator)) {
    await cancelNativeCravingNotification();
    clearPersistedCravingEndsAt();
    return;
  }

  clearPersistedCravingEndsAt();
  await cancelNativeCravingNotification();
  await postToServiceWorker({ type: "CRAVING_TIMER_CLEAR" });
}

export function tryFocusApp() {
  if (typeof window === "undefined") return;
  window.focus();
}

export async function resyncCravingTimerInWorker(endsAt: number | null) {
  if (!endsAt || endsAt <= Date.now()) return;
  await scheduleCravingTimerInWorker(endsAt);
}

export async function registerCravingBackgroundChecks() {
  await registerBackgroundTimerCheck();
  await postToServiceWorker({ type: "CRAVING_REGISTER_SYNC" });
}
