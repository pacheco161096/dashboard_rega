import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const isAuth = req.cookies.get("loginUser");
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard") && !isAuth) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isAuth && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
