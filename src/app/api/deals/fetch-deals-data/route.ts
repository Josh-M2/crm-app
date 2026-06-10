import prismaInstance from "@/app/lib/prismaInstance";
import { getOrgMembership } from "@/app/lib/routeAuth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const body = req.nextUrl.searchParams;
  const selectedOrg = body.get("selectedOrg");

  if (!selectedOrg) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const auth = await getOrgMembership(req, selectedOrg);

  if ("response" in auth) return auth.response;

  const dealsData = await prismaInstance.deal.findMany({
    where: { organizationId: selectedOrg },
    select: {
      id: true,
      name: true,
      amount: true,
      status: true,
      owner: true,
      updatedAt: true,
    },
  });

  if (dealsData === undefined) {
    return NextResponse.json(
      { error: "no categorized leads found" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { dealsData, userRole: auth.membership },
    { status: 200 }
  );
}
