import prismaInstance from "@/lib/prismaInstance";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { selectedOrg, name, amount, status, userid } = body;
  console.log("body: ", body);

  if (!selectedOrg || !name || !amount || !status || !userid) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  //   //if not admin logic
  //   const userId = await prismaInstance.user.findUnique({
  //     where: {
  //       email,
  //     },
  //     select: {
  //       id: true,
  //     },
  //   });

  //   if (!userId) {
  //     return NextResponse.json({ error: "no user found" }, { status: 404 });
  //   }
  const capitalizedStatus = status.toUpperCase();
  console.log("capitalizedStatus", capitalizedStatus);

  const addedCategorizedLead = await prismaInstance.deal.create({
    data: {
      name,
      amount,
      status: capitalizedStatus,
      organizationId: selectedOrg,
      ownerId: userid,
    },
  });

  if (!addedCategorizedLead) {
    return NextResponse.json(
      { error: "no created deal category found " },
      { status: 404 }
    );
  }
  return NextResponse.json({ addedCategorizedLead }, { status: 200 });
}
