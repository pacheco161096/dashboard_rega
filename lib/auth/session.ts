/** Claves de sesión usadas en el dashboard */
export const SESSION_KEYS = {
  LOGIN_USER: "loginUser",
  CAJA: "caja",
  SELECTED_USER: "selectedUser",
} as const;

/** Claves locales de UI (tickets) que deben limpiarse al cerrar sesión */
const LOCAL_UI_KEYS = [
  "ticket_reassigned_ids:v1",
  "ticket_reassigned_ids",
  "ticket_technician_overrides",
] as const;

export interface SessionUser {
  id: number | string;
  nombre: string;
  email: string;
  role: string;
  roleName?: string;
}

async function setAuthCookie() {
  try {
    await fetch("/api/auth/session", {
      method: "POST",
      credentials: "same-origin",
    });
  } catch {
    // El middleware fallará el gate si la cookie no se pudo fijar
  }
}

async function clearAuthCookie() {
  try {
    await fetch("/api/auth/session", {
      method: "DELETE",
      credentials: "same-origin",
    });
  } catch {
    // Continuar limpiando sessionStorage aunque falle la cookie
  }
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

export async function setSessionUser(user: SessionUser) {
  sessionStorage.setItem(SESSION_KEYS.LOGIN_USER, JSON.stringify(user));
  await setAuthCookie();
}

/** Limpia sesión, cookie de auth y estado residual del dashboard */
export async function clearSession() {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(SESSION_KEYS.LOGIN_USER);
  sessionStorage.removeItem(SESSION_KEYS.CAJA);
  sessionStorage.removeItem(SESSION_KEYS.SELECTED_USER);

  LOCAL_UI_KEYS.forEach((key) => localStorage.removeItem(key));
  await clearAuthCookie();
}

/**
 * Cierra sesión y redirige al login con recarga completa.
 * Evita que los estilos globales se desmonten al salir del layout del dashboard.
 */
export async function redirectToLogin() {
  if (typeof window === "undefined") return;

  await clearSession();
  window.location.replace("/");
}

export function isAuthenticated(): boolean {
  return getSessionUser() !== null;
}

/** Indica si hay una caja abierta en Cobranza (persistida en sessionStorage). */
export function isCajaOpen(): boolean {
  if (typeof window === "undefined") return false;

  const raw = sessionStorage.getItem(SESSION_KEYS.CAJA);
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw);
    return parsed != null && typeof parsed === "object";
  } catch {
    return false;
  }
}
