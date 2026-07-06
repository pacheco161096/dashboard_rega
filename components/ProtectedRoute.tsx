'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  getFirstAllowedPath,
  getRoutePermissionKey,
  getUserPermissions,
} from '@/lib/roles';
import { clearSession, isAuthenticated } from '@/lib/auth/session';
import { toast } from '@/hooks/use-toast';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      setIsReady(false);
      clearSession();
      router.replace('/');
      return;
    }

    let permissions;
    try {
      permissions = getUserPermissions();
    } catch {
      setIsReady(false);
      clearSession();
      router.replace('/');
      return;
    }

    if (!permissions) {
      setIsReady(false);
      clearSession();
      router.replace('/');
      return;
    }

    const permissionKey = getRoutePermissionKey(pathname);
    if (permissionKey && permissions[permissionKey] !== true) {
      setIsReady(false);
      const fallback = getFirstAllowedPath(permissions);
      toast({
        title: 'Acceso denegado',
        description: 'No tienes permiso para acceder a este módulo',
        variant: 'destructive',
      });
      router.replace(fallback !== pathname ? fallback : '/');
      return;
    }

    setIsReady(true);
  }, [router, pathname]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
        Verificando autenticación...
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
