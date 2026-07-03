"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** El login real está en `/`. Esta ruta solo redirige. */
export default function DashboardLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-16 text-gray-600">
      Redirigiendo al inicio de sesión...
    </div>
  );
}
