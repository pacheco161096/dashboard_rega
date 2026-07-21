import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "loginUser";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días

/** Establece la cookie de auth HttpOnly usada por el middleware. */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "1",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return response;
}

/** Elimina la cookie de auth HttpOnly. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
