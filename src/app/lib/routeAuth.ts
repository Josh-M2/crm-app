import prismaInstance from "@/app/lib/prismaInstance";
import type { OrganizationUserRole } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export type OrganizationRole = OrganizationUserRole;
type AuthFailure = { response: NextResponse };
type CurrentUser = { id: string; email: string };
type CurrentUserResult = AuthFailure | { user: CurrentUser };
type OrgMembershipResult =
  | AuthFailure
  | { user: CurrentUser; membership: { role: OrganizationRole } };

export async function getCurrentUser(
  req: NextRequest
): Promise<CurrentUserResult> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.email) {
    return {
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }

  const user = await prismaInstance.user.findUnique({
    where: { email: token.email },
    select: { id: true, email: true },
  });

  if (!user) {
    return {
      response: NextResponse.json({ error: "no user found" }, { status: 404 }),
    };
  }

  return { user };
}

export async function getOrgMembership(
  req: NextRequest,
  organizationId: string
): Promise<OrgMembershipResult> {
  const auth = await getCurrentUser(req);

  if ("response" in auth) return auth;

  const membership = await prismaInstance.organizationUser.findFirst({
    where: {
      userId: auth.user.id,
      organizationId,
    },
    select: {
      role: true,
    },
  });

  if (!membership) {
    return {
      response: NextResponse.json({ error: "forbidden" }, { status: 403 }),
    };
  }

  return { user: auth.user, membership };
}

export function requireOrgRole(
  role: OrganizationRole,
  allowedRoles: OrganizationRole[]
) {
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: "unauthorized access" }, { status: 401 });
  }

  return null;
}

export async function isOrgUser(userId: string, organizationId: string) {
  const membership = await prismaInstance.organizationUser.findFirst({
    where: {
      userId,
      organizationId,
    },
    select: {
      id: true,
    },
  });

  return Boolean(membership);
}
