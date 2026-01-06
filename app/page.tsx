'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import logo from '../media/logo.png'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { getRedirectPathByRole, UserRole } from '@/lib/roles'

const Page = ({}) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const user = e.currentTarget.user.value;
    const password = e.currentTarget.password.value;

    try {
      const response = await axios.get(
        `https://monkfish-app-2et8k.ondigitalocean.app/api/usuarios?filters[usuario][$eq]=${user}&filters[contrasena][$eq]=${password}&populate=role`
      )
      if (response.data?.data?.length > 0) {
        const { data } = response.data
        // Obtener el rol del usuario
        const roleId = data[0].attributes.role?.data?.id?.toString() || 
                      data[0].attributes.role?.id?.toString() || 
                      data[0].attributes.role?.toString() || 
                      null
        
        const finalRole = roleId || "1"; // Por defecto Admin si no tiene rol asignado
        
        const loginUser = {
          id: data[0].id,
          nombre: data[0].attributes.nombre,
          email: data[0].attributes.email,
          role: finalRole,
        }
        sessionStorage.setItem("loginUser", JSON.stringify(loginUser));
        setError(null);
        
        // Redirigir según el rol
        const redirectPath = getRedirectPathByRole(finalRole as UserRole);
        router.replace(redirectPath);
      } else {
        setError("ErrorData");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Error en la conexión");
      } else {
        setError("Error inesperado");
      }
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
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <Image 
              src={logo} 
              alt="Rega Telecom Logo" 
              className="w-auto h-12 sm:h-16 object-contain"
              priority
            />
          </div>

          {/* Título */}
          <div className="text-center mb-2 sm:mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Bienvenido</h1>
            <p className="text-xs sm:text-sm text-gray-400">Inicia sesión para continuar</p>
          </div>

          {/* Input Usuario */}
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

          {/* Input Contraseña */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-300 sr-only">
              Contraseña
            </label>
            <div className='relative w-full group'>
              <div className='absolute left-3 top-1/2 -translate-y-1/2 text-white z-10 pointer-events-none transition-colors duration-200 group-focus-within:text-indigo-400'>
                <i className="fa-solid fa-lock text-lg"></i>
              </div>
              <input 
                id="password"
                name='password' 
                type="password" 
                placeholder='Contraseña' 
                required 
                autoComplete="current-password"
                className='login-input w-full h-12 pl-11 pr-4 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200'
              />
            </div>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className='bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2'>
              <i className="fa-light fa-triangle-exclamation text-red-400"></i>
              <p className='text-red-400 text-sm'>
                {error === 'ErrorData' ? 'Usuario o contraseña incorrectos' : error}
              </p>
            </div>
          )}

          {/* Botón de Login */}
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