// /components/ProtectedRoute.tsx

'use client';  // Esto marca el archivo como un componente de cliente

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const ProtectedRoute = ({ children }) => {
  // const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Asegúrate de que el código solo se ejecute en el cliente
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const userLogin = sessionStorage.getItem('loginUser'); // Reemplaza con la lógica de tu sesión
      if (!userLogin) {
       // router.push('/login'); // Redirige si no hay sesión
      }
    }
  }, [isClient]);

  // Si estamos en el cliente y el usuario no está autenticado, no mostramos nada hasta que se haya hecho la redirección
  if (!isClient) {
    return null; // No renderizamos nada en el servidor
  }

  return <>{children}</>;
};

export default ProtectedRoute;

