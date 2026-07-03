"use client";
import { useEffect, useState } from "react";
import { PersonFillIcon, SignOutIcon } from "@primer/octicons-react";
import s from "../../../app/global.module.css";
import { useRouter } from "next/navigation";
import { getRoleDisplayName } from "@/lib/roles";
import { clearSession, getSessionUser, type SessionUser } from "@/lib/auth/session";
import { ConfirmActionModal } from "@/components/molecules/ConfirmActionModal/ConfirmActionModal";

export default function InfoClient() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isModalSession, setIsModalSession] = useState(false);

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  const logout = () => {
    clearSession();
    setIsModalSession(false);
    router.replace("/");
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
          onClick={() => setIsModalSession(true)}
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
    </>
  );
}
