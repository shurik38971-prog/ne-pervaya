export function getAdminSecret() {
  return process.env.ADMIN_SECRET ?? "";
}

export function isAdminKeyValid(key: string | null) {
  const secret = getAdminSecret();
  if (!secret || !key) return false;
  return key === secret;
}

export function getAdminKeyFromUrl() {
  if (typeof window === "undefined") return null;

  return new URLSearchParams(window.location.search).get("key");
}
