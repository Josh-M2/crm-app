import { NextRequest, NextResponse } from "next/server";
import prismaInstance from "@/app/lib/prismaInstance";
import { getCurrentUser } from "@/app/lib/routeAuth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getCurrentUser(req);

    if ("response" in auth) return auth.response;

    const userWithOrganizations =
      await prismaInstance.organizationUser.findMany({
        where: { userId: auth.user.id },
        select: {
          role: true,
          organization: true,
        },
      });

    if (!userWithOrganizations) {
      return NextResponse.json(
        { error: "no organization found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ userWithOrganizations }, { status: 200 });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
