import prismaInstance from "@/app/lib/prismaInstance";
import { getOrgMembership, requireOrgRole } from "@/app/lib/routeAuth";
import { NextRequest, NextResponse } from "next/server";

const validRoles = ["AGENT", "MINER", "ADMIN", "DELETE"] as const;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { role, orgUserId, selectedOrg } = body;

  if (!role || !orgUserId || !selectedOrg) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const auth = await getOrgMembership(req, selectedOrg);

  if ("response" in auth) return auth.response;

  const roleError = requireOrgRole(auth.membership.role, ["ADMIN"]);

  if (roleError) return roleError;

  if (role === "DELETE") {
    const deleteUserFromOrg = await prismaInstance.organizationUser.deleteMany({
      where: {
        id: orgUserId,
        organizationId: selectedOrg,
      },
    });
    if (deleteUserFromOrg.count === 0)
      return NextResponse.json({ error: "no user found " }, { status: 404 });
  } else {
    const updatedUserRole = await prismaInstance.organizationUser.updateMany({
      where: {
        id: orgUserId,
        organizationId: selectedOrg,
      },
      data: {
        role,
      },
    });
    if (updatedUserRole.count === 0)
      return NextResponse.json({ error: "no user found " }, { status: 404 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
