import prismaInstance from "@/app/lib/prismaInstance";
import { getOrgMembership } from "@/app/lib/routeAuth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const body = req.nextUrl.searchParams;
  const selectedOrg = body.get("selectedOrg");
  const catid = body.get("catId");

  if (!selectedOrg || !catid) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const auth = await getOrgMembership(req, selectedOrg);

  if ("response" in auth) return auth.response;

  const leadList = await prismaInstance.lead.findMany({
    where: {
      categoryId: catid,
      organizationId: selectedOrg,
    },
  });

  if (leadList === undefined) {
    return NextResponse.json({ error: "no lead list found" }, { status: 404 });
  }

  return NextResponse.json(
    { leadList, userRole: auth.membership },
    { status: 200 }
  );
}
