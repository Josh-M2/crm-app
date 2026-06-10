import prismaInstance from "@/app/lib/prismaInstance";
import { getOrgMembership, requireOrgRole } from "@/app/lib/routeAuth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, selectedOrg } = body;

  if (!id || !selectedOrg)
    return NextResponse.json({ error: "Missing field" }, { status: 400 });

  const auth = await getOrgMembership(req, selectedOrg);

  if ("response" in auth) return auth.response;

  const roleError = requireOrgRole(auth.membership.role, ["ADMIN"]);

  if (roleError) return roleError;

  const deal = await prismaInstance.deal.findFirst({
    where: {
      id,
      organizationId: selectedOrg,
    },
    select: {
      name: true,
    },
  });

  if (!deal)
    return NextResponse.json(
      { error: "no deleted data found" },
      { status: 404 }
    );

  const deletedDeal = await prismaInstance.deal.deleteMany({
    where: {
      id,
      organizationId: selectedOrg,
    },
  });

  if (deletedDeal.count === 0)
    return NextResponse.json(
      { error: "no deleted data found" },
      { status: 404 }
    );

  const createdActivity = await prismaInstance.activity.create({
    data: {
      description: `Deleted deal ${deal.name}`,
      userId: auth.user.id,
      organizationId: selectedOrg,
    },
  });

  return NextResponse.json(
    { succes: true, deletedDeal, createdActivity },
    { status: 200 }
  );
}
