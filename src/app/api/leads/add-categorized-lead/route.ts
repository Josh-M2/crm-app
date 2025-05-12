import prismaInstance from "@/lib/prismaInstance";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  //   if (!token)
  //     return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const { email, selectedOrg, ownerId } = body;

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

  //   const categorizedLeads = await prismaInstance.leadCategory.findMany({
  //     where: {
  //       organizationId: selectedOrg,
  //     },
  //   });

  //   // if (categorizedLeads !== undefined) {
  //   //   return NextResponse.json(
  //   //     { error: "no categorized leads found" },
  //   //     { status: 404 }
  //   //   );
  //   // }

  //   return NextResponse.json({ categorizedLeads }, { status: 200 });
}
