import prismaInstance from "@/lib/prismaInstance";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const token = getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await req.json();

    const { email, organizationId, inviteId } = body;
    console.log(body);

    if (!email || !organizationId)
      return NextResponse.json({ error: "missing fields" }, { status: 400 });

    const userID = await prismaInstance.user.findUnique({
      where: { email: email },
      select: { id: true },
    });

    console.log("userID", userID);

    if (!userID)
      return NextResponse.json({ error: "no user found" }, { status: 404 });

    const invite = await prismaInstance.invite.update({
      where: { id: inviteId },
      data: { accepted: true },
    });

    if (!invite)
      return NextResponse.json(
        { error: "no invite data foun" },
        { status: 404 }
      );

    const updatedOrganizationuser =
      await prismaInstance.organizationUser.create({
        data: {
          userId: userID.id,
          organizationId: organizationId,
          role: "AGENT",
        },
      });

    if (!updatedOrganizationuser)
      return NextResponse.json(
        { error: "no invite data found" },
        { status: 404 }
      );

    console.log("updatedOrganizationuser: ", updatedOrganizationuser);

    return NextResponse.json({ Success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
