import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const AUTH_COOKIE_NAME = "bacardin_auth";

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Пропускаем API routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Проверяем админские маршруты (с учетом локали)
  const isAdminRoute = pathname.includes("/admin");
  const isLoginRoute = pathname.includes("/login");

  if (isAdminRoute && !isLoginRoute) {
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME);

    if (authCookie?.value !== "authenticated") {
      // Получаем локаль из pathname
      const locale = pathname.split("/")[1];
      const validLocales = ["en", "ru"];
      const currentLocale = validLocales.includes(locale) ? locale : "en";
      
      const loginUrl = new URL(`/${currentLocale}/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Применяем i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
