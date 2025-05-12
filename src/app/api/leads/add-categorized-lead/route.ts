import prismaInstance from "@/lib/prismaInstance";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const { email, categoryName, selectedOrg, ownerId, isAdmin } = body;
  console.log("body: ", body);

  if (
    !email ||
    !selectedOrg ||
    !selectedOrg ||
    !ownerId ||
    isAdmin === undefined
  ) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!isAdmin) {
    const userId = await prismaInstance.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (!userId) {
      return NextResponse.json({ error: "no user found" }, { status: 404 });
    }

    const addedCategorizedLead = await prismaInstance.leadCategory.create({
      data: {
        name: categoryName,
        ownerId: ownerId,
        assignedToId: userId.id,
        organizationId: selectedOrg,
      },
    });

    if (!addedCategorizedLead) {
      return NextResponse.json(
        { error: "no created lead category found " },
        { status: 404 }
      );
    }
    return NextResponse.json({ addedCategorizedLead }, { status: 200 });
  } else {
    const addedCategorizedLead = await prismaInstance.leadCategory.create({
      data: {
        name: categoryName,
        ownerId: ownerId,
        assignedToId: email, //email is is automatically a userID
        organizationId: selectedOrg,
      },
    });

    if (!addedCategorizedLead) {
      return NextResponse.json(
        { error: "no created lead category found " },
        { status: 404 }
      );
    }
    return NextResponse.json({ addedCategorizedLead }, { status: 200 });
  }
}
