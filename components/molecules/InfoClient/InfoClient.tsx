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
    <div className={s.contentUser}>
      <div>
        <PersonFillIcon size={24} />
        <span>{user?.nombre || ""}</span>
      </div>
      <div className="cursor-pointer" onClick={() => setIsModalSession(true)}>
        <SignOutIcon size={24} className={s.iconSinOut} />
      </div>
      
      {isModalSession && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <h2 className="text-lg font-semibold text-gray-800">¿Cerrar sesión?</h2>
            <p className="text-gray-600 mt-2">¿Estás seguro de que deseas cerrar sesión?</p>
            <div className="mt-4 flex justify-around">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={() => {
                  logout();
                  setIsModalSession(false);
                }}
              >
                Confirmar
              </button>
              <button
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                onClick={() => setIsModalSession(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}