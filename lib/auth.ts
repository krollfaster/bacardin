import { cookies } from "next/headers";

const AUTH_COOKIE_NAME = "bacardin_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 дней

// Проверка пароля
export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("ADMIN_PASSWORD не установлен в переменных окружения");
    return false;
  }
  return password === adminPassword;
}

// Установка auth cookie
export async function setAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

// Удаление auth cookie (logout)
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

// Проверка авторизации
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  return authCookie?.value === "authenticated";
}

// Получение значения cookie для middleware
export function getAuthCookieName(): string {
  return AUTH_COOKIE_NAME;
}

