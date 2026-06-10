import prismaInstance from "@/app/lib/prismaInstance";
import { getOrgMembership, isOrgUser } from "@/app/lib/routeAuth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { dealId, selectedOrg, name, amount, ownerId, status } = body;

  if (!dealId || !selectedOrg || !name || !status || !amount || !ownerId)
    return NextResponse.json({ error: "Missing field" }, { status: 400 });

  const auth = await getOrgMembership(req, selectedOrg);

  if ("response" in auth) return auth.response;

  const ownerIsOrgUser = await isOrgUser(ownerId, selectedOrg);

  if (!ownerIsOrgUser) {
    return NextResponse.json({ error: "invalid owner" }, { status: 400 });
  }

  const capitalizedStatus = status.toUpperCase();

  const deal = await prismaInstance.deal.findFirst({
    where: {
      id: dealId,
      organizationId: selectedOrg,
    },
    select: {
      id: true,
    },
  });

  if (!deal)
    return NextResponse.json({ error: "no deal found" }, { status: 404 });

  const updatedDeal = await prismaInstance.deal.update({
    where: {
      id: dealId,
    },
    data: {
      name,
      ownerId,
      amount,
      status: capitalizedStatus,
      updatedAt: new Date(),
    },
  });

  if (!updatedDeal)
    return NextResponse.json(
      { error: "no updafated deal found" },
      { status: 404 }
    );

  //should get the dealName instead of leadName
  //   const catgoryName = await prismaInstance.leadCategory.findUnique({
  //     where: {
  //       id: categoryId,
  //     },
  //     select: {
  //       name: true,
  //     },
  //   });

  //   if (!catgoryName)
  //     return NextResponse.json({ error: "no category found" }, { status: 404 });

  //   const createdActivity = await prismaInstance.activity.create({
  //     data: {
  //       description: `Updated a lead to ${catgoryName.name}`,
  //       userId: userId.id,
  //       organizationId: organizationId,
  //       leadId: updatedLead.id,
  //     },
  //   });

  return NextResponse.json(
    {
      updatedDeal,
      //createdActivity,
    },
    { status: 200 }
  );
}
