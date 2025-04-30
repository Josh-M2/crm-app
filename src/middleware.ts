// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { protectedRoutes } from "./middleware/protectRoutes"; // adjust path as needed

export async function middleware(req: NextRequest) {
  const result = await protectedRoutes(req);
  if (result) return result;

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard"],
};
