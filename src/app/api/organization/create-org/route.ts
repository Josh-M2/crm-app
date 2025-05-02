import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import prismaInstance from "@/lib/prismaInstance";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: "unauthorized", status: 401 });
    }
    const body = await req.json();
    const { email: userEmail, organizationName, organizationCode } = body;

    if (!organizationName || !userEmail || !organizationCode) {
      return NextResponse.json({
        error: "Missing fields",
        status: 400,
      });
    }

    const userId = await prismaInstance.user.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    console.log("userId123", userId);

    if (!userId) {
      return NextResponse.json({ error: "no userId Found", status: 204 });
    }

    const createdOrg = await prismaInstance.organization.create({
      data: {
        name: organizationName,
        code: organizationCode,
        ownerId: userId.id,
      },
    });

    if (!createdOrg) {
      return NextResponse.json({ error: "org not created", status: 204 });
    }

    console.log("createdOrg: ", createdOrg);

    const createOrgUser = await prismaInstance.organizationUser.create({
      data: {
        role: "ADMIN",
        userId: createdOrg.ownerId,
        organizationId: createdOrg.id,
      },
    });

    if (!createOrgUser) {
      return NextResponse.json({ error: "orguser not created", status: 204 });
    }

    return NextResponse.json(
      { message: "organization created" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
