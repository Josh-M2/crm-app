// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { protectedRoutes } from "./middleware/protectRoutes";

export async function middleware(req: NextRequest) {
  const result = await protectedRoutes(req);
  if (result) return result;

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/analytics",
    "/dashboard",
    "/deals",
    "/leads",
    "/settings",
    "/set-up-organization",
  ],
};
