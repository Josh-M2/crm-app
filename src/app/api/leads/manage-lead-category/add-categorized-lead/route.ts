import prismaInstance from "@/app/lib/prismaInstance";
import { getOrgMembership, isOrgUser } from "@/app/lib/routeAuth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object")
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const { assignedUserId, categoryName, selectedOrg, ownerId } = body;

  if (typeof categoryName !== "string" || !categoryName.trim() ||
      typeof selectedOrg !== "string" || !selectedOrg ||
      typeof ownerId !== "string" || !ownerId ||
      (assignedUserId !== undefined && (typeof assignedUserId !== "string" || !assignedUserId))) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const auth = await getOrgMembership(req, selectedOrg);

  if ("response" in auth) return auth.response;

  const ownerIsOrgUser = await isOrgUser(ownerId, selectedOrg);

  if (!ownerIsOrgUser) {
    return NextResponse.json({ error: "invalid owner" }, { status: 400 });
  }

  const assignedToId =
    auth.membership.role === "ADMIN" && assignedUserId ? assignedUserId : auth.user.id;

  const assignedUserIsOrgUser = await isOrgUser(assignedToId, selectedOrg);

  if (!assignedUserIsOrgUser) {
    return NextResponse.json({ error: "invalid assignee" }, { status: 400 });
  }

  const addedCategorizedLead = await prismaInstance.leadCategory.create({
    data: {
      name: categoryName.trim(),
      ownerId,
      assignedToId,
      organizationId: selectedOrg,
    },
  });

  if (!addedCategorizedLead) {
    return NextResponse.json(
      { error: "no created lead category found " },
      { status: 404 }
    );
  }

  const createdActivity = await prismaInstance.activity.create({
    data: {
      description: `Created lead category ${addedCategorizedLead.name}`,
      userId: auth.user.id,
      organizationId: selectedOrg,
      leadCategoryId: addedCategorizedLead.id,
    },
  });

  return NextResponse.json(
    { addedCategorizedLead, createdActivity },
    { status: 200 }
  );
}
