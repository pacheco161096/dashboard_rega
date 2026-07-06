'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import logo from '../media/logo.png'
import { useRouter } from 'next/navigation'
import { getRedirectPathByRole, getRoleDisplayName, resolveRoleId } from '@/lib/roles'
import { setSessionUser } from '@/lib/auth/session'
import { businessApi, handleApiError } from '@/lib/api/config'
import { PasswordInput } from '@/components/ui/password-input'

interface LoginUsuarioAttributes {
  nombre?: string
  email?: string
  rol?: string
  role?: unknown
}

interface LoginUsuarioItem {
  id: number
  attributes: LoginUsuarioAttributes
}

const Page = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = e.currentTarget;
    const user = form.user.value.trim();
    const password = form.password.value;

    try {
      const response = await businessApi.get<{ data: LoginUsuarioItem[] }>("/usuarios", {
        params: {
          "filters[usuario][$eq]": user,
          "filters[contrasena][$eq]": password,
        },
      });

      const users = response.data?.data ?? [];
      if (users.length === 0) {
        setError("ErrorData");
        return;
      }

      const account = users[0];
      const attributes = account.attributes;
      // API actual: attributes.rol = "Admin" | "Cajero" | "Tecnico" | "Supervisor"
      const roleId =
        resolveRoleId(attributes.rol) ||
        resolveRoleId(attributes.role);

      if (!roleId) {
        setError("Tu usuario no tiene un rol asignado. Contacta al administrador.");
        return;
      }

      setSessionUser({
        id: account.id,
        nombre: attributes.nombre || user,
        email: attributes.email || "",
        role: roleId,
        roleName: getRoleDisplayName(roleId),
      });

      router.replace(getRedirectPathByRole(roleId));
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message || "Error en la conexión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 w-full min-h-screen flex justify-center items-center font-normal px-4 py-8'>
      <div className="w-full max-w-md">
        <form
          onSubmit={(e) => login(e)}
          className="bg-gray-800/95 backdrop-blur-sm shadow-2xl rounded-2xl flex flex-col p-6 sm:p-8 gap-4 sm:gap-6 border border-gray-700/50"
        >
          <div className="flex justify-center mb-2">
            <Image
              src={logo}
              alt="Rega Telecom Logo"
              className="w-auto h-12 sm:h-16 object-contain"
              priority
            />
          </div>

          <div className="text-center mb-2 sm:mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Bienvenido</h1>
            <p className="text-xs sm:text-sm text-gray-400">Inicia sesión para continuar</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="user" className="text-sm font-medium text-gray-300 sr-only">
              Usuario
            </label>
            <div className='relative w-full group'>
              <div className='absolute left-3 top-1/2 -translate-y-1/2 text-white z-10 pointer-events-none transition-colors duration-200 group-focus-within:text-indigo-400'>
                <i className="fa-solid fa-user text-lg"></i>
              </div>
              <input
                id="user"
                name='user'
                type="text"
                placeholder='Usuario'
                required
                autoComplete="username"
                className='login-input w-full h-12 pl-11 pr-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200'
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-300 sr-only">
              Contraseña
            </label>
            <div className='relative w-full group'>
              <div className='absolute left-3 top-1/2 -translate-y-1/2 text-white z-10 pointer-events-none transition-colors duration-200 group-focus-within:text-indigo-400'>
                <i className="fa-solid fa-lock text-lg"></i>
              </div>
              <PasswordInput
                id="password"
                name="password"
                placeholder="Contraseña"
                required
                autoComplete="current-password"
                className="login-input w-full h-12 pl-11 pr-11 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                toggleClassName="text-gray-400 hover:text-indigo-400 z-10"
              />
            </div>
          </div>

          {error && (
            <div className='bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2'>
              <i className="fa-light fa-triangle-exclamation text-red-400"></i>
              <p className='text-red-400 text-sm'>
                {error === 'ErrorData' ? 'Usuario o contraseña incorrectos' : error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className='bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold px-4 py-3 rounded-lg w-full transition-all duration-200 shadow-lg hover:shadow-indigo-500/50 flex items-center justify-center gap-2'
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <i className="fa-light fa-arrow-right text-sm"></i>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Page;
