import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaInstance";
import { getToken } from "next-auth/jwt";
import prismaInstance from "@/lib/prismaInstance";
import { user } from "@heroui/react";

export async function GET(req: NextRequest) {
  try {
    // const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    // if (!token) {
    //   return NextResponse.json({ error: "unauthorized", status: 401 });
    // }
    const body = req.nextUrl.searchParams;
    const email = body.get("email");
    console.log("email: ", email);
    console.log("body: ", email);

    if (!email) {
      return NextResponse.json({ error: "Missing emaol" }, { status: 400 });
    }

    const userID = await prismaInstance.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!userID) {
      return NextResponse.json({ error: "no userid found" }, { status: 404 });
    }

    const userWithOrganizations =
      await prismaInstance.organizationUser.findMany({
        where: { userId: userID.id },
        select: {
          role: true,
          organization: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });

    if (!userWithOrganizations) {
      return NextResponse.json(
        { error: "no organization found" },
        { status: 404 }
      );
    }

    console.log("userWithOrganizations, ", userWithOrganizations);

    // return NextResponse.json({ success: true }, { status: 200 });

    // const userWithOrg = await prisma.user.findUnique({
    //   where: { email },
    //   include: {
    //     ownedOrganizations: true,
    //     organizations: {
    //       include: {
    //         organization: true,
    //       },
    //     },
    //   },
    // });

    // if (!userWithOrg) {
    //   return NextResponse.json({ error: "User not found" }, { status: 404 });
    // }
    // console.log("user:", userWithOrg);

    // const owned = userWithOrg.ownedOrganizations;
    // const notOwned = userWithOrg.organizations
    //   .filter((orgUser) => orgUser.organization.ownerId !== userWithOrg.id)
    //   .map((orgUser) => orgUser.organization);

    // if (owned) console.log("owned: ", owned);
    // if (notOwned) console.log("notOwned: ", notOwned);

    return NextResponse.json({ userWithOrganizations }, { status: 200 });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
