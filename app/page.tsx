'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import logo from '../media/logo.png'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const Page = ({}) => {
  const [error, setError] = useState<string | null>(null); // Ahora el estado es un string o null
  const router = useRouter();

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = e.currentTarget.user.value;
    const password = e.currentTarget.password.value;

    try {
      const response = await axios.get(
        `https://monkfish-app-2et8k.ondigitalocean.app/api/usuarios?filters[usuario][$eq]=${user}&filters[contrasena][$eq]=${password}`
      )
      if (response.data?.data?.length > 0) {
        const { data } = response.data
        const loginUser = {
          id: data[0].id,
          nombre: data[0].attributes.nombre,
          email: data[0].attributes.email,
        }
        sessionStorage.setItem("loginUser", JSON.stringify(loginUser));
        setError(null); // Limpia el error si el login es exitoso
        router.replace('/dashboard');
      } else {
        setError("ErrorData");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Error en la conexión");
      } else {
        setError("Error inesperado");
      }
    }
  };

  return (
    <div className='bg-gray-900 w-full h-screen flex justify-center items-center font-normal text-sm'>
      <form onSubmit={(e) => login(e)} className="bg-gray-800 w-[300px] h-[300px] shadow-lg rounded-lg flex justify-center items-center flex-col p-4 gap-3">
        <Image src={logo} alt=""/>
        <div className='w-full h-10 border border-gray-900 rounded-lg flex p-2 gap-2 justify-center items-center'>
          <span>
            <i className="fa-regular fa-user"></i>
          </span>
          <input name='user' type="text" placeholder='Usuario' required className='bg-transparent border-none outline-none w-[90%] h-full  [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance:textfield]'/>
        </div>
        <div className='w-full h-10 border border-gray-900 rounded-lg flex p-2 gap-2 justify-center items-center'>
          <span>
            <i className="fa-light fa-lock"></i>
          </span>
          <input name='password' type="password" placeholder='Password' required className='bg-transparent border-none outline-none w-[90%] h-full  [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance:textfield]'/>
        </div>
        <button className='bg-indigo-600 text-white px-4 py-2 rounded w-full'>
          Iniciar Sesión
        </button>
        { error == 'ErrorData' && <div className='text-red-500'>Revisa tu información</div> }
      </form>
    </div>
  )
}

export default Page;