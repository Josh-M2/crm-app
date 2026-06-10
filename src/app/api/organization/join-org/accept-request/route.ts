import prismaInstance from "@/app/lib/prismaInstance";
import { getOrgMembership, requireOrgRole } from "@/app/lib/routeAuth";
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
        { status: 404 }
      );

    const userID = await prismaInstance.user.findUnique({
      where: { email: invite.email },
      select: { id: true },
    });

    if (!userID)
      return NextResponse.json({ error: "no user found" }, { status: 404 });

    await prismaInstance.invite.update({
      where: { id: inviteId },
      data: { accepted: true },
    });

    const updatedOrganizationuser =
      await prismaInstance.organizationUser.create({
        data: {
          userId: userID.id,
          organizationId: organizationId,
          role: "AGENT",
        },
      });

    if (!updatedOrganizationuser)
      return NextResponse.json(
        { error: "no invite data found" },
        { status: 404 }
      );

    return NextResponse.json({ Success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
