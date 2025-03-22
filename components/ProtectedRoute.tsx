// /components/ProtectedRoute.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const loginUser = sessionStorage.getItem('loginUser');
    if (!loginUser) {
      router.replace('/'); // Evita usar push para prevenir el historial de navegación no deseado
    } else {
      setIsAuth(true);
    }
  }, [router]);

  if (isAuth === null) return <p>Verificando autenticación...</p>;

  return <>{children}</>;
};

export default ProtectedRoute;

