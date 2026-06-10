import prismaInstance from "@/app/lib/prismaInstance";
import { getOrgMembership, requireOrgRole } from "@/app/lib/routeAuth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { inviteId, selectedOrg } = body;

  if (!inviteId || !selectedOrg)
    return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const auth = await getOrgMembership(req, selectedOrg);

  if ("response" in auth) return auth.response;

  const roleError = requireOrgRole(auth.membership.role, ["ADMIN"]);

  if (roleError) return roleError;

  const invite = await prismaInstance.invite.findFirst({
    where: {
      id: inviteId,
      organizationId: selectedOrg,
    },
    select: {
      email: true,
    },
  });

  if (!invite) {
    return NextResponse.json({ error: "no invite found" }, { status: 404 });
  }

  await prismaInstance.invite.deleteMany({
    where: {
      id: inviteId,
      organizationId: selectedOrg,
    },
  });

  const createdActivity = await prismaInstance.activity.create({
    data: {
      description: `Declined join request from ${invite.email}`,
      userId: auth.user.id,
      organizationId: selectedOrg,
    },
  });

  return NextResponse.json({ success: true, createdActivity }, { status: 200 });
}
