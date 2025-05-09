import prismaInstance from "@/lib/prismaInstance";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();

  const { email, organizationCode } = body;

  const orgID = await prismaInstance.organization.findUnique({
    where: {
      code: organizationCode,
    },
    select: {
      id: true,
    },
  });

  if (!orgID)
    return NextResponse.json(
      { error: "no organization found" },
      { status: 204 }
    );

  const inviteData = await prismaInstance.invite.create({
    data: {
      email,
      code: organizationCode,
      organizationId: orgID.id,
    },
  });

  if (!inviteData)
    return NextResponse.json(
      { error: "invite data not found" },
      { status: 404 }
    );

  return NextResponse.json({ success: true }, { status: 200 });
}
