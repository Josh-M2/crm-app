import prismaInstance from "@/lib/prismaInstance";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    name,
    company,
    email,
    leadEmail,
    status,
    organizationId,
    categoryId,
  } = body;
  console.log("body: ", body);

  if (
    !name ||
    !company ||
    !email ||
    !status ||
    !leadEmail ||
    !organizationId ||
    !categoryId
  )
    return NextResponse.json({ error: "Missing field" }, { status: 400 });

  const userId = await prismaInstance.user.findUnique({
    where: { email },
    select: {
      id: true,
    },
  });

  if (!userId) {
    return NextResponse.json({ error: "no user found" }, { status: 404 });
  }

  const createdLead = await prismaInstance.lead.create({
    data: {
      name,
      company,
      email: leadEmail,
      status,
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

  const catgoryName = await prismaInstance.leadCategory.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      name: true,
    },
  });

  if (!catgoryName)
    return NextResponse.json({ error: "no category found" }, { status: 404 });

  const createdActivity = await prismaInstance.activity.create({
    data: {
      description: `Added a new lead to ${catgoryName.name}`,
      userId: userId.id,
      organizationId: organizationId,
      leadId: createdLead.id,
    },
  });

  return NextResponse.json({ createdLead, createdActivity }, { status: 200 });
}
