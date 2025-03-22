import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const isAuth = req.cookies.get('loginUser'); // Verifica si el usuario está autenticado
  const { pathname } = req.nextUrl;

  // Rutas protegidas dentro de dashboard
  const protectedRoutes = ['/dashboard', '/dashboard/cobranza', '/dashboard/customers'];

  // Si intenta entrar a una ruta protegida sin autenticación, lo mandamos al login
  if (protectedRoutes.includes(req.nextUrl.pathname) && !isAuth) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Si está autenticado y entra a una ruta inexistente (ejemplo: /customers), lo redirigimos a dashboard
  if (isAuth && !pathname.startsWith('/dashboard') && pathname !== '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'], // Protege todas las rutas dentro de /dashboard
};