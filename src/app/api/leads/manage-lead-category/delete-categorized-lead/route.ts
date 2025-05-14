import prismaInstance from "@/lib/prismaInstance";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, isAdmin } = body;

  if (!id)
    return NextResponse.json({ error: "Missing field" }, { status: 400 });

  if (!isAdmin)
    return NextResponse.json({ error: "unauthorized access" }, { status: 401 });

  const deletedCategorziedLead = await prismaInstance.leadCategory.delete({
    where: {
      id: id,
    },
  });

  if (!deletedCategorziedLead)
    return NextResponse.json(
      { error: "no deleted data found" },
      { status: 404 }
    );

  return NextResponse.json(
    { succes: true, deletedCategorziedLead },
    { status: 200 }
  );
}
