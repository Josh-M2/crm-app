import prismaInstance from "@/app/lib/prismaInstance";
import { getCurrentUser } from "@/app/lib/routeAuth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const auth = await getCurrentUser(req);

  if ("response" in auth) return auth.response;

  const body = await req.json();

  const { organizationCode } = body;

  if (!organizationCode) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

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
      email: auth.user.email,
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
