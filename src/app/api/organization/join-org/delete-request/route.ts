import prismaInstance from "@/app/lib/prismaInstance";
import { getOrgMembership, requireOrgRole } from "@/app/lib/routeAuth";
import { NotificationType, OrganizationUserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { inviteId, selectedOrg } = body;

  if (!inviteId || !selectedOrg)
    return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const auth = await getOrgMembership(req, selectedOrg);

  if ("response" in auth) return auth.response;

  const roleError = requireOrgRole(auth.membership.role, [
    OrganizationUserRole.ADMIN,
  ]);

  if (roleError) return roleError;

  const invite = await prismaInstance.invite.findFirst({
    where: {
      id: inviteId,
      organizationId: selectedOrg,
    },
    select: {
      email: true,
      organization: {
        select: {
          name: true,
        },
      },
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

  const requestedUser = await prismaInstance.user.findUnique({
    where: { email: invite.email },
    select: { id: true },
  });

  if (requestedUser) {
    await prismaInstance.notification.create({
      data: {
        userId: requestedUser.id,
        organizationId: selectedOrg,
        type: NotificationType.JOIN_DECLINED,
        title: "Request declined",
        message: `Your request to join ${invite.organization.name} was declined`,
        href: "/organization",
      },
    });
  }

  const createdActivity = await prismaInstance.activity.create({
    data: {
      description: `Declined join request from ${invite.email}`,
      userId: auth.user.id,
      organizationId: selectedOrg,
    },
  });

  return NextResponse.json({ success: true, createdActivity }, { status: 200 });
}
