"use client";
import { useEffect, useState } from "react";
import { PersonFillIcon, SignOutIcon } from "@primer/octicons-react";
import s from "../../../app/global.module.css";
import { useRouter } from "next/navigation";

export interface UserLoginInt {
  id: string;
  nombre: string;
  email: string;
}

export default function InfoClient() {
  const router = useRouter();
  const [user, setUser] = useState<UserLoginInt>();
  const [isModalSession, setIsModalSession] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = sessionStorage.getItem("loginUser");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  const logout = () => {
    sessionStorage.removeItem("loginUser"); // Eliminar sesión
    router.replace("/"); // Redirigir a login
  };

  return (
    <>
      <div className={s.contentUser}>
        <div className={s.userInfo}>
          <PersonFillIcon size={20} className="text-gray-600 flex-shrink-0" />
          <span className={s.userName}>{user?.nombre || "Usuario"}</span>
        </div>
        <button 
          className={s.logoutButton}
          onClick={() => setIsModalSession(true)}
          aria-label="Cerrar sesión"
        >
          <SignOutIcon size={20} className="text-red-500" />
        </button>
      </div>
      
      {isModalSession && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">¿Cerrar sesión?</h2>
            <p className="text-gray-600 text-sm mb-4">¿Estás seguro de que deseas cerrar sesión?</p>
            <div className="flex gap-3 justify-center">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
                onClick={() => setIsModalSession(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                onClick={() => {
                  logout();
                  setIsModalSession(false);
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}