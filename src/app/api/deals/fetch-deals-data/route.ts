import prismaInstance from "@/lib/prismaInstance";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = req.nextUrl.searchParams;
  const email = body.get("email");
  const selectedOrg = body.get("selectedOrg");
  console.log("email: ", email);
  console.log("selectedOrg: ", selectedOrg);

  console.log("body: ", body);

  if (!email || !selectedOrg) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

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

  const userRole = await prismaInstance.organizationUser.findFirst({
    where: {
      userId: userId.id,
      organizationId: selectedOrg,
    },
    select: {
      role: true,
    },
  });

  if (!userRole)
    return NextResponse.json({ error: "no userRole found" }, { status: 404 });

  const dealsData = await prismaInstance.deal.findMany({
    where: { organizationId: selectedOrg },
    select: {
      id: true,
      name: true,
      amount: true,
      status: true,
      owner: true,
      updatedAt: true,
    },
  });

  if (dealsData === undefined) {
    return NextResponse.json(
      { error: "no categorized leads found" },
      { status: 404 }
    );
  }
  console.log("dealsData: ", dealsData);
  return NextResponse.json({ dealsData, userRole }, { status: 200 });
}
