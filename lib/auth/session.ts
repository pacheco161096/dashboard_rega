/** Claves de sesión usadas en el dashboard */
export const SESSION_KEYS = {
  LOGIN_USER: "loginUser",
  CAJA: "caja",
  SELECTED_USER: "selectedUser",
} as const;

/** Claves locales de UI (tickets) que deben limpiarse al cerrar sesión */
const LOCAL_UI_KEYS = [
  "ticket_reassigned_ids",
  "ticket_technician_overrides",
] as const;

const AUTH_COOKIE_NAME = "loginUser";

export interface SessionUser {
  id: number | string;
  nombre: string;
  email: string;
  role: string;
  roleName?: string;
}

function setAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; SameSite=Lax`;
}

function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(SESSION_KEYS.LOGIN_USER);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function setSessionUser(user: SessionUser) {
  sessionStorage.setItem(SESSION_KEYS.LOGIN_USER, JSON.stringify(user));
  setAuthCookie();
}

/** Limpia sesión, cookie de auth y estado residual del dashboard */
export function clearSession() {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(SESSION_KEYS.LOGIN_USER);
  sessionStorage.removeItem(SESSION_KEYS.CAJA);
  sessionStorage.removeItem(SESSION_KEYS.SELECTED_USER);

  LOCAL_UI_KEYS.forEach((key) => localStorage.removeItem(key));
  clearAuthCookie();
}

export function isAuthenticated(): boolean {
  return getSessionUser() !== null;
}
