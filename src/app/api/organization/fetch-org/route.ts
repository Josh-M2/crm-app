import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaInstance";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: "unauthorized", status: 401 });
    }
    const body = req.nextUrl.searchParams;
    const email = body.get("email");
    console.log("email: ", email);

    if (!email) {
      return NextResponse.json({ error: "Missing emaol" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        ownedOrganizations: true,
        organizations: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const owned = user.ownedOrganizations;
    const notOwned = user.organizations
      .filter((orgUser) => orgUser.organization.ownerId !== user.id)
      .map((orgUser) => orgUser.organization);

    if (owned) console.log("owned: ", owned);
    if (notOwned) console.log("notOwned: ", notOwned);

    return NextResponse.json({ data: { owned, notOwned } }, { status: 200 });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
