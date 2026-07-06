'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  getFirstAllowedPath,
  getRoutePermissionKey,
  getUserPermissions,
} from '@/lib/roles';
import { isAuthenticated, redirectToLogin } from '@/lib/auth/session';
import { toast } from '@/hooks/use-toast';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      setIsReady(false);
      redirectToLogin();
      return;
    }

    let permissions;
    try {
      permissions = getUserPermissions();
    } catch {
      setIsReady(false);
      redirectToLogin();
      return;
    }

    if (!permissions) {
      setIsReady(false);
      redirectToLogin();
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
