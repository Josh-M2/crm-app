import prismaInstance from "@/app/lib/prismaInstance";
import { getOrgMembership } from "@/app/lib/routeAuth";
import { parseLeadFields } from "@/app/lib/leads/validation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object")
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const {
    name,
    company,
    leadEmail,
    status,
    organizationId,
    categoryId,
    leadId,
  } = body;

  if (typeof organizationId !== "string" || !organizationId ||
      typeof categoryId !== "string" || !categoryId ||
      typeof leadId !== "string" || !leadId)
    return NextResponse.json({ error: "Missing field" }, { status: 400 });

  const parsed = parseLeadFields({ name, company, email: leadEmail, status });
  if (!parsed.ok)
    return NextResponse.json({ error: parsed.error }, { status: 400 });

  const auth = await getOrgMembership(req, organizationId);

  if ("response" in auth) return auth.response;

  const updatedLeadResult = await prismaInstance.lead.updateMany({
    where: {
      id: leadId,
      organizationId,
      categoryId,
    },
    data: {
      name: parsed.value.name,
      company: parsed.value.company,
      email: parsed.value.email,
      status: parsed.value.status,
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
