import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutePrefixes = [
  "/analytics",
  "/dashboard",
  "/deals",
  "/leads",
  "/settings",
];

const authRoutes = ["/login", "/signup"];

const isRouteMatch = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`);

export async function protectedRoutes(req: NextRequest) {
  const url = req.nextUrl.clone();
  const isProtectedRoute = protectedRoutePrefixes.some((route) =>
    isRouteMatch(url.pathname, route)
  );
  const isAuthRoute = authRoutes.includes(url.pathname);

  if (!isProtectedRoute && !isAuthRoute) return null;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return null;
}
