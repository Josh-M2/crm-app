import prismaInstance from "@/lib/prismaInstance";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  //   if (!token)
  //     return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { dealId, name, amount, ownerId, status } = body;

  if (!dealId || !name || !status || !amount || !ownerId)
    return NextResponse.json({ error: "Missing field" }, { status: 400 });

  //   const userId = await prismaInstance.user.findUnique({
  //     where: { email },
  //     select: {
  //       id: true,
  //     },
  //   });

  //   if (!userId) {
  //     return NextResponse.json({ error: "no user found" }, { status: 404 });
  //   }

  const capitalizedStatus = status.toUpperCase();

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
