import prismaInstance from "@/app/lib/prismaInstance";
import { getOrgMembership } from "@/app/lib/routeAuth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name,
    company,
    leadEmail,
    status,
    organizationId,
    categoryId,
    leadId,
  } = body;

  if (
    !name ||
    !company ||
    !status ||
    !leadEmail ||
    !organizationId ||
    !categoryId ||
    !leadId
  )
    return NextResponse.json({ error: "Missing field" }, { status: 400 });

  const auth = await getOrgMembership(req, organizationId);

  if ("response" in auth) return auth.response;

  const capitalizedStatus = status.toUpperCase();

  const updatedLeadResult = await prismaInstance.lead.updateMany({
    where: {
      id: leadId,
      organizationId,
      categoryId,
    },
    data: {
      name,
      company,
      email: leadEmail,
      status: capitalizedStatus,
      //organizationId,
      // categoryId,
      lastInteraction: new Date(),
    },
  });

  if (updatedLeadResult.count === 0)
    return NextResponse.json(
      { error: "no updafated lead found" },
      { status: 404 }
    );

  const updatedLead = await prismaInstance.lead.findFirst({
    where: {
      id: leadId,
      organizationId,
      categoryId,
    },
  });

  if (!updatedLead)
    return NextResponse.json(
      { error: "no updafated lead found" },
      { status: 404 }
    );

  const catgoryName = await prismaInstance.leadCategory.findFirst({
    where: {
      id: categoryId,
      organizationId,
    },
    select: {
      name: true,
    },
  });

  if (!catgoryName)
    return NextResponse.json({ error: "no category found" }, { status: 404 });

  const createdActivity = await prismaInstance.activity.create({
    data: {
      description: `Updated a lead to ${catgoryName.name}`,
      userId: auth.user.id,
      organizationId: organizationId,
      leadId: updatedLead.id,
    },
  });

  return NextResponse.json({ updatedLead, createdActivity }, { status: 200 });
}
