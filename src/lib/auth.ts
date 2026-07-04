export const AUTH_TOKEN_KEY = "nu-admin-token";
export const AUTH_ADMIN_KEY = "nu-admin-user";
export const AUTH_COOKIE_NAME = "nu_admin_token";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getStoredToken() {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredAdmin() {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_ADMIN_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredSession(token: string, admin: unknown) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.localStorage.setItem(AUTH_ADMIN_KEY, JSON.stringify(admin));
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${
    60 * 60 * 24 * 7
  }; samesite=lax`;
}

export function clearStoredSession() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_ADMIN_KEY);
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}
