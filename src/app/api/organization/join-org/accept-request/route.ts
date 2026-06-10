import prismaInstance from "@/app/lib/prismaInstance";
import { getOrgMembership, requireOrgRole } from "@/app/lib/routeAuth";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { organizationId, inviteId } = body;

    if (!organizationId || !inviteId)
      return NextResponse.json({ error: "missing fields" }, { status: 400 });

    const auth = await getOrgMembership(req, organizationId);

    if ("response" in auth) return auth.response;

    const roleError = requireOrgRole(auth.membership.role, ["ADMIN"]);

    if (roleError) return roleError;

    const invite = await prismaInstance.invite.findFirst({
      where: {
        id: inviteId,
        organizationId,
        accepted: false,
      },
      select: {
        email: true,
      },
    });

    if (!invite)
      return NextResponse.json(
        { error: "no invite data found" },
        { status: 404 },
      );

    const userID = await prismaInstance.user.findUnique({
      where: { email: invite.email },
      select: { id: true, name: true, email: true },
    });

    if (!userID)
      return NextResponse.json({ error: "no user found" }, { status: 404 });

    const updatedOrganizationuser = await prismaInstance.$transaction(
      async (tx: Prisma.TransactionClient) => {
        await tx.invite.update({
          where: { id: inviteId },
          data: { accepted: true },
        });

        return tx.organizationUser.upsert({
          where: {
            userId_organizationId: {
              userId: userID.id,
              organizationId,
            },
          },
          update: {},
          create: {
            userId: userID.id,
            organizationId,
            role: "AGENT",
          },
        });
      },
    );

    if (!updatedOrganizationuser)
      return NextResponse.json(
        { error: "no invite data found" },
        { status: 404 },
      );

    const createdActivity = await prismaInstance.activity.create({
      data: {
        description: `Accepted ${
          userID.name ?? userID.email
        } into the organization`,
        userId: auth.user.id,
        organizationId,
      },
    });

    return NextResponse.json(
      { Success: true, createdActivity },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
