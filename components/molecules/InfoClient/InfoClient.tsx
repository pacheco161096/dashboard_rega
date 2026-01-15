"use client";
import { useEffect, useState } from "react";
import { PersonFillIcon, SignOutIcon } from "@primer/octicons-react";
import s from "../../../app/global.module.css";
import { useRouter } from "next/navigation";
import { ROLES_ARRAY, UserRole, ROLE_NAMES } from "@/lib/roles";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface UserLoginInt {
  id: string;
  nombre: string;
  email: string;
  role?: string;
}

export default function InfoClient() {
  const router = useRouter();
  const [user, setUser] = useState<UserLoginInt>();
  const [isModalSession, setIsModalSession] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = sessionStorage.getItem("loginUser");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Si no tiene rol, asignar Admin por defecto
        if (!parsedUser.role) {
          const updatedUser = { ...parsedUser, role: UserRole.ADMIN };
          sessionStorage.setItem("loginUser", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      }
    }
  }, []);

  const handleRoleChange = (newRole: string) => {
    if (user) {
      const updatedUser = { ...user, role: newRole };
      sessionStorage.setItem("loginUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
      // Recargar la página para aplicar los cambios de permisos
      window.location.reload();
    }
  };

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
        
        {/* Selector de rol para pruebas */}
        <div className="flex items-center gap-2 mr-2">
          <Select
            value={user?.role || UserRole.ADMIN}
            onValueChange={handleRoleChange}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              {ROLES_ARRAY.map((rol) => (
                <SelectItem key={rol.id} value={rol.value}>
                  {rol.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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