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
  } = body;

  if (
    !name ||
    !company ||
    !status ||
    !leadEmail ||
    !organizationId ||
    !categoryId
  )
    return NextResponse.json({ error: "Missing field" }, { status: 400 });

  const auth = await getOrgMembership(req, organizationId);

  if ("response" in auth) return auth.response;

  const category = await prismaInstance.leadCategory.findFirst({
    where: {
      id: categoryId,
      organizationId,
    },
    select: {
      name: true,
    },
  });

  if (!category)
    return NextResponse.json({ error: "no category found" }, { status: 404 });

  const capitalizedStatus = status.toUpperCase();

  const createdLead = await prismaInstance.lead.create({
    data: {
      name,
      company,
      email: leadEmail,
      status: capitalizedStatus,
      organizationId,
      categoryId,
      lastInteraction: new Date(),
    },
  });

  if (!createdLead)
    return NextResponse.json(
      { error: "no crreated lead found" },
      { status: 404 }
    );

  const createdActivity = await prismaInstance.activity.create({
    data: {
      description: `Added a new lead to ${category.name}`,
      userId: auth.user.id,
      organizationId: organizationId,
      leadId: createdLead.id,
    },
  });

  return NextResponse.json({ createdLead, createdActivity }, { status: 200 });
}
