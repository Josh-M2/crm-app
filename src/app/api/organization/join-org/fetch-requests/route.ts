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

  const orgCode = await prismaInstance.organization.findUnique({
    where: {
      id: orgID as string,
    },
    select: {
      code: true,
    },
  });

  if (!orgCode) {
    return NextResponse.json({ error: "no org found" }, { status: 404 });
  }

  const orgIniviteData = await prismaInstance.invite.findMany({
    where: {
      code: orgCode.code,
      accepted: false,
    },
  });

  if (!orgIniviteData)
    return NextResponse.json(
      { error: "no invites data found" },
      { status: 404 }
    );

  return NextResponse.json({ orgIniviteData }, { status: 200 });
}
