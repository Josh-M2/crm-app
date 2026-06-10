import prismaInstance from "@/app/lib/prismaInstance";
import { getOrgMembership, requireOrgRole } from "@/app/lib/routeAuth";
import { OrganizationUserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const validActions = ["AGENT", "MINER", "ADMIN", "DELETE"] as const;
type ManageUserAction = (typeof validActions)[number];
const editableRoles: OrganizationUserRole[] = ["AGENT", "MINER", "ADMIN"];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { role, orgUserId, selectedOrg } = body;

  if (!role || !orgUserId || !selectedOrg) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!validActions.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const action = role as ManageUserAction;

  const auth = await getOrgMembership(req, selectedOrg);

  if ("response" in auth) return auth.response;

  const roleError = requireOrgRole(auth.membership.role, ["ADMIN"]);

  if (roleError) return roleError;

  const targetMembership = await prismaInstance.organizationUser.findFirst({
    where: {
      id: orgUserId,
      organizationId: selectedOrg,
    },
    select: {
      userId: true,
      role: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      organization: {
        select: {
          ownerId: true,
        },
      },
    },
  });

  if (!targetMembership) {
    return NextResponse.json({ error: "no user found" }, { status: 404 });
  }

  if (targetMembership.userId === auth.user.id) {
    return NextResponse.json(
      { error: "admins cannot manage their own membership" },
      { status: 400 }
    );
  }

  if (targetMembership.userId === targetMembership.organization.ownerId) {
    return NextResponse.json(
      { error: "organization owner cannot be removed or demoted" },
      { status: 400 }
    );
  }

  if (targetMembership.role === "ADMIN" && action !== "ADMIN") {
    const adminCount = await prismaInstance.organizationUser.count({
      where: {
        organizationId: selectedOrg,
        role: "ADMIN",
      },
    });

    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "organization must keep at least one admin" },
        { status: 400 }
      );
    }
  }

  const targetUserName =
    targetMembership.user.name ?? targetMembership.user.email;
  let activityDescription = "";

  if (action === "DELETE") {
    const deleteUserFromOrg = await prismaInstance.organizationUser.deleteMany({
      where: {
        id: orgUserId,
        organizationId: selectedOrg,
      },
    });
    if (deleteUserFromOrg.count === 0)
      return NextResponse.json({ error: "no user found" }, { status: 404 });

    activityDescription = `Removed ${targetUserName} from the organization`;
  } else {
    if (!editableRoles.includes(action)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

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
      return NextResponse.json({ error: "no user found" }, { status: 404 });

    activityDescription = `Changed ${targetUserName}'s role to ${action}`;
  }

  const createdActivity = await prismaInstance.activity.create({
    data: {
      description: activityDescription,
      userId: auth.user.id,
      organizationId: selectedOrg,
    },
  });

  return NextResponse.json({ success: true, createdActivity }, { status: 200 });
}
