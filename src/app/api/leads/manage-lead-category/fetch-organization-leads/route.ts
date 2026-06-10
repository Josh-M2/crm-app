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

  const categorizedLeads = await prismaInstance.leadCategory.findMany({
    where: {
      organizationId: selectedOrg,
    },
    select: {
      id: true,
      name: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (categorizedLeads === undefined) {
    return NextResponse.json(
      { error: "no categorized leads found" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { categorizedLeads, userRole: auth.membership },
    { status: 200 }
  );
}
