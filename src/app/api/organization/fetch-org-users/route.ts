import prismaInstance from "@/lib/prismaInstance";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = req.nextUrl.searchParams;

  const orgID = body.get("selectedOrg");
  if (!orgID) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const orgUser = await prismaInstance.organizationUser.findMany({
    where: {
      organizationId: orgID,
    },
    select: {
      id: true,
      role: true,
      user: true,
    },
  });

  if (!orgUser)
    return NextResponse.json({ error: "No Org found" }, { status: 404 });

  return NextResponse.json({ orgUser }, { status: 200 });
}
