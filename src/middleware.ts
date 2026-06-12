import { NextRequest, NextResponse } from "next/server";
import { protectedRoutes } from "./middleware/protectRoutes";
import { applySecurityHeaders, rateLimitRequest } from "./middleware/security";

export async function middleware(req: NextRequest) {
  const rateLimitResponse = rateLimitRequest(req);
  if (rateLimitResponse) return applySecurityHeaders(rateLimitResponse);

  const result = await protectedRoutes(req);
  if (result) return applySecurityHeaders(result);

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/api/:path*",
    "/analytics/:path*",
    "/dashboard/:path*",
    "/deals/:path*",
    "/leads/:path*",
    "/settings/:path*",
    "/testimony/:path*",
    "/login",
    "/signup",
    "/reset-password",
  ],
};
