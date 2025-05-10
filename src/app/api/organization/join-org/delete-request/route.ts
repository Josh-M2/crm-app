import prismaInstance from "@/lib/prismaInstance";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();

  const { inviteId } = body;
  console.log(body);

  if (!inviteId)
    return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const deletedRequest = await prismaInstance.invite.delete({
    where: {
      id: inviteId,
    },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
