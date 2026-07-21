"use client";
import { useState, useSyncExternalStore } from "react";
import { PersonFillIcon, SignOutIcon } from "@primer/octicons-react";
import s from "../../../app/global.module.css";
import { useRouter } from "next/navigation";
import { getRoleDisplayName } from "@/lib/roles";
import {
  isCajaOpen,
  redirectToLogin,
  SESSION_KEYS,
  type SessionUser,
} from "@/lib/auth/session";
import { ConfirmActionModal } from "@/components/molecules/ConfirmActionModal/ConfirmActionModal";

/**
 * Cache del snapshot: useSyncExternalStore exige referencia estable
 * (JSON.parse devolvería un objeto nuevo en cada llamada → bucle infinito).
 */
let cachedRaw: string | null = null;
let cachedUser: SessionUser | null = null;

/** sessionStorage no emite eventos en la misma pestaña; el logout hace full reload. */
function subscribeToSession() {
  return () => {};
}

function getClientSessionSnapshot(): SessionUser | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(SESSION_KEYS.LOGIN_USER);
  if (raw === cachedRaw) return cachedUser;

  cachedRaw = raw;
  if (!raw) {
    cachedUser = null;
    return null;
  }

  try {
    cachedUser = JSON.parse(raw) as SessionUser;
  } catch {
    cachedUser = null;
  }
  return cachedUser;
}

function getServerSessionSnapshot(): SessionUser | null {
  return null;
}

export default function InfoClient() {
  const router = useRouter();
  const user = useSyncExternalStore(
    subscribeToSession,
    getClientSessionSnapshot,
    getServerSessionSnapshot
  );
  const [isModalSession, setIsModalSession] = useState(false);
  const [isCajaBlockModal, setIsCajaBlockModal] = useState(false);

  const requestLogout = () => {
    if (isCajaOpen()) {
      setIsCajaBlockModal(true);
      return;
    }

    setIsModalSession(true);
  };

  const logout = () => {
    if (isCajaOpen()) {
      setIsModalSession(false);
      setIsCajaBlockModal(true);
      return;
    }

    setIsModalSession(false);
    redirectToLogin();
  };

  const goToCobranza = () => {
    setIsCajaBlockModal(false);
    router.push("/dashboard/cobranza");
  };

  const roleLabel = getRoleDisplayName(user?.role || user?.roleName);

  return (
    <>
      <div className={s.contentUser}>
        <div className={s.userInfo}>
          <PersonFillIcon size={20} className="text-gray-600 flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className={s.userName}>{user?.nombre || "Usuario"}</span>
            {roleLabel && roleLabel !== "Sin rol" && (
              <span className="text-xs text-gray-500 truncate">{roleLabel}</span>
            )}
          </div>
        </div>

        <button
          type="button"
          className={s.logoutButton}
          onClick={requestLogout}
          aria-label="Cerrar sesión"
        >
          <SignOutIcon size={20} className="text-red-500" />
        </button>
      </div>

      <ConfirmActionModal
        open={isModalSession}
        title="¿Cerrar sesión?"
        description="¿Estás seguro de que deseas cerrar sesión?"
        confirmLabel="Confirmar"
        onConfirm={logout}
        onCancel={() => setIsModalSession(false)}
      />

      <ConfirmActionModal
        open={isCajaBlockModal}
        title="No se puede cerrar sesión"
        description="Tienes una caja abierta en Cobranza. Debes cerrarla antes de salir del sistema."
        confirmLabel="Ir a Cobranza"
        cancelLabel="Entendido"
        onConfirm={goToCobranza}
        onCancel={() => setIsCajaBlockModal(false)}
      />
    </>
  );
}
