import prismaInstance from "@/app/lib/prismaInstance";
import { getOrgMembership } from "@/app/lib/routeAuth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const body = req.nextUrl.searchParams;

  const orgID = body.get("selectedOrg");
  if (!orgID) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const auth = await getOrgMembership(req, orgID);

  if ("response" in auth) return auth.response;

  const orgUser = await prismaInstance.organizationUser.findMany({
    where: {
      organizationId: orgID,
    },
    select: {
      id: true,
      role: true,
      user: true,
    },
  });

  if (!orgUser)
    return NextResponse.json({ error: "No Org found" }, { status: 404 });

  return NextResponse.json({ orgUser }, { status: 200 });
}
