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

  await prismaInstance.invite.deleteMany({
    where: {
      id: inviteId,
      organizationId: selectedOrg,
    },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
