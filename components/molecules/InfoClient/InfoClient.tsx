"use client";
import { useEffect, useState } from "react";
import { PersonFillIcon, SignOutIcon } from "@primer/octicons-react";
import s from "../../../app/global.module.css";
import { useRouter } from "next/navigation";
import { getRoleDisplayName } from "@/lib/roles";
import {
  getSessionUser,
  isCajaOpen,
  redirectToLogin,
  type SessionUser,
} from "@/lib/auth/session";
import { ConfirmActionModal } from "@/components/molecules/ConfirmActionModal/ConfirmActionModal";

export default function InfoClient() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isModalSession, setIsModalSession] = useState(false);
  const [isCajaBlockModal, setIsCajaBlockModal] = useState(false);

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

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
