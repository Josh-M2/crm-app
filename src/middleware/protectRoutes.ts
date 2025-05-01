import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function protectedRoutes(req: NextRequest) {
  const url = req.nextUrl.clone();
  console.log("Middleware trigg", req);

  const protectedRoutes = ["/dashboard"];

  if (protectedRoutes.includes(url.pathname)) {
    console.log("checking toke");

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      url.pathname = "/login";
      console.log("No token found, redirecting to /login...");
      return NextResponse.redirect(url);
    }

    console.log("Token found, user is authenticated.");
  }

  return null;
}
