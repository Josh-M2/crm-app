import { NextRequest, NextResponse } from "next/server";
import prismaInstance from "@/app/lib/prismaInstance";
import { getCurrentUser } from "@/app/lib/routeAuth";

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser(req);

    if ("response" in auth) return auth.response;

    const body = await req.json();
    const { organizationName, organizationCode } = body;

    if (!organizationName || !organizationCode) {
      return NextResponse.json({
        error: "Missing fields",
        status: 400,
      });
    }

    const createdOrg = await prismaInstance.organization.create({
      data: {
        name: organizationName,
        code: organizationCode,
        ownerId: auth.user.id,
      },
    });

    if (!createdOrg) {
      return NextResponse.json({ error: "org not created", status: 404 });
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
      return NextResponse.json({ error: "orguser not created", status: 404 });
    }

    return NextResponse.json(
      { message: "organization created" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
