import prismaInstance from "@/lib/prismaInstance";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { role, orgUserId } = body;

  if (!role || !orgUserId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  console.log("orgUserId: ", orgUserId);
  console.log("role", role);

  if (role === "DELETE") {
    const deleteUserFromOrg = await prismaInstance.organizationUser.delete({
      where: {
        id: orgUserId,
      },
    });
    if (!deleteUserFromOrg)
      return NextResponse.json({ error: "no user found " }, { status: 404 });
  } else {
    const updatedUserRole = await prismaInstance.organizationUser.update({
      where: {
        id: orgUserId,
      },
      data: {
        role,
      },
    });
    if (!updatedUserRole)
      return NextResponse.json({ error: "no user found " }, { status: 404 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
