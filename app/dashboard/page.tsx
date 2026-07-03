"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getDefaultAllowedPath,
  getRoleDisplayName,
  getUserPermissions,
  getUserRole,
} from "@/lib/roles";
import { getSessionUser } from "@/lib/auth/session";

export default function DashboardHome() {
  const router = useRouter();
  const permissions = getUserPermissions();
  const user = getSessionUser();
  const roleName = getRoleDisplayName(getUserRole());

  useEffect(() => {
    if (!permissions?.canAccessInicio) {
      router.replace(getDefaultAllowedPath());
    }
  }, [permissions, router]);

  if (!permissions?.canAccessInicio) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-600">
        Redirigiendo...
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Panel de control
        </h2>
        <p className="text-gray-600 mb-4">
          Bienvenido{user?.nombre ? `, ${user.nombre}` : ""}.
        </p>
        <p className="text-sm text-gray-500">
          Rol actual: <span className="font-medium text-gray-700">{roleName}</span>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Usa el menú lateral para acceder a los módulos disponibles.
        </p>
      </div>
    </div>
  );
}
