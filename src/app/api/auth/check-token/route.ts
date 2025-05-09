import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import axiosInstance from "@/lib/axiosInstance";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (token) {
      return NextResponse.json({ message: "already logged in", status: 200 });
    } else {
      return null;
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
