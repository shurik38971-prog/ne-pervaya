const ADMIN_SESSION_KEY = "admin_session_ok";

export function getAdminSecret() {
  return (
    process.env.ADMIN_SECRET ??
    process.env.NEXT_PUBLIC_ADMIN_SECRET ??
    ""
  ).trim();
}

export function isAdminKeyValid(key: string | null) {
  const secret = getAdminSecret();
  if (!secret || !key) return false;
  return key.trim() === secret;
}

export function getAdminKeyFromUrl() {
  if (typeof window === "undefined") return null;

  return new URLSearchParams(window.location.search).get("key");
}

export function isAdminSessionValid() {
  if (typeof window === "undefined") return false;

  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
}

export function setAdminSessionValid() {
  sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
}

export type AdminAccessResult =
  | { ok: true }
  | { ok: false; reason: "no_secret" | "missing_key" | "invalid_key" };

export function checkAdminAccess(): AdminAccessResult {
  const secret = getAdminSecret();

  if (!secret) {
    return { ok: false, reason: "no_secret" };
  }

  if (isAdminSessionValid()) {
    return { ok: true };
  }

  const key = getAdminKeyFromUrl();

  if (!key) {
    return { ok: false, reason: "missing_key" };
  }

  if (!isAdminKeyValid(key)) {
    return { ok: false, reason: "invalid_key" };
  }

  setAdminSessionValid();
  return { ok: true };
}
