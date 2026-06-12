import prismaInstance from "@/app/lib/prismaInstance";
import { getCurrentUser } from "@/app/lib/routeAuth";
import { NotificationType, OrganizationUserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const auth = await getCurrentUser(req);

  if ("response" in auth) return auth.response;

  const body = await req.json();

  const { organizationCode } = body;

  if (!organizationCode) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const org = await prismaInstance.organization.findUnique({
    where: {
      code: organizationCode,
    },
    select: {
      id: true,
      name: true,
      users: {
        where: { role: OrganizationUserRole.ADMIN },
        select: { userId: true },
      },
    },
  });

  if (!org)
    return NextResponse.json(
      { error: "no organization found" },
      { status: 204 }
    );

  const inviteData = await prismaInstance.$transaction(async (tx) => {
    const invite = await tx.invite.create({
      data: {
        email: auth.user.email,
        code: organizationCode,
        organizationId: org.id,
      },
    });

    if (org.users.length > 0) {
      await tx.notification.createMany({
        data: org.users.map((admin) => ({
          userId: admin.userId,
          organizationId: org.id,
          type: NotificationType.JOIN_REQUEST,
          title: "New join request",
          message: `${auth.user.email} requested to join ${org.name}`,
          href: "/settings/manage-users?tab=Requests",
        })),
      });
    }

    return invite;
  });

  if (!inviteData)
    return NextResponse.json(
      { error: "invite data not found" },
      { status: 404 }
    );

  return NextResponse.json({ success: true }, { status: 200 });
}
