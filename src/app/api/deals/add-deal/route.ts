import prismaInstance from "@/app/lib/prismaInstance";
import { getOrgMembership, isOrgUser } from "@/app/lib/routeAuth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { selectedOrg, name, amount, status, userid } = body;

  if (!selectedOrg || !name || !amount || !status || !userid) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const auth = await getOrgMembership(req, selectedOrg);

  if ("response" in auth) return auth.response;

  const ownerIsOrgUser = await isOrgUser(userid, selectedOrg);

  if (!ownerIsOrgUser) {
    return NextResponse.json({ error: "invalid owner" }, { status: 400 });
  }

  const capitalizedStatus = status.toUpperCase();

  const addedDeal = await prismaInstance.deal.create({
    data: {
      name,
      amount,
      status: capitalizedStatus,
      organizationId: selectedOrg,
      ownerId: userid,
    },
  });

  if (!addedDeal) {
    return NextResponse.json(
      { error: "no created deal category found " },
      { status: 404 }
    );
  }

  const createdActivity = await prismaInstance.activity.create({
    data: {
      description: `Created deal ${addedDeal.name}`,
      userId: auth.user.id,
      organizationId: selectedOrg,
      dealId: addedDeal.id,
    },
  });

  return NextResponse.json(
    { addedCategorizedLead: addedDeal, createdActivity },
    { status: 200 }
  );
}
