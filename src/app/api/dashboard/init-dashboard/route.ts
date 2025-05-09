import { getToken } from "next-auth/jwt";
import { NextResponse, NextRequest } from "next/server";
import prismaInstance from "@/lib/prismaInstance";
import {
  differenceInMinutes,
  differenceInHours,
  formatDistanceToNow,
} from "date-fns";

export async function GET(req: NextRequest) {
  try {
    console.log("params", req.nextUrl.searchParams);
    const body = req.nextUrl.searchParams;
    const email = body.get("email");
    const selectedOrg = body.get("selectedOrg");
    console.log("selectedOrg: ", selectedOrg);
    console.log("email: ", email);

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    if (!email || !selectedOrg) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const userId = await prismaInstance.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!userId) {
      return NextResponse.json({ error: "no user found" }, { status: 204 });
    }

    // const organizationId = await prismaInstance.organizationUser.findMany({
    //   where: { userId: userId.id },
    //   select: { id: true },
    // });

    // if (!organizationId) {
    //   return NextResponse.json({ error: "no org found" }, { status: 204 });
    // }

    console.log("organizationId", selectedOrg);

    const [
      leadCount,
      convertedLeadCount,
      activeDeals,
      totalRevenue,
      activities,
    ] = await Promise.all([
      prismaInstance.lead.count({
        where: { organizationId: selectedOrg },
      }),
      prismaInstance.lead.count({
        where: { organizationId: selectedOrg, status: "CONVERTED" }, // adjust to your status enum
      }),
      prismaInstance.deal.count({
        where: { organizationId: selectedOrg, status: "PENDING" }, // adjust to your status enum
      }),
      prismaInstance.deal.aggregate({
        where: { organizationId: selectedOrg },
        _sum: { amount: true },
      }),
      prismaInstance.activity.findMany({
        where: {
          organizationId: selectedOrg,
        },
        include: {
          user: true,
          lead: true,
          deal: true,
        },
        orderBy: {
          date: "desc",
        },
        take: 8,
      }),
    ]);
    404;

    if (
      leadCount === undefined ||
      convertedLeadCount === undefined ||
      activeDeals === undefined ||
      totalRevenue === undefined ||
      activities === undefined
    )
      return NextResponse.json(
        { error: "one of promise has no value" },
        { status: 404 }
      );

    const conversionRate =
      leadCount > 0 ? (convertedLeadCount / leadCount) * 100 : 0;
    const revenue = totalRevenue._sum.amount || 0;

    const activitiesWithTimeAgo = activities.map((activity) => ({
      ...activity,
      timeAgo: formatDistanceToNow(activity.date, { addSuffix: true }),
    }));

    console.log("leadCount", leadCount);

    console.log("revenue", revenue);

    console.log("conversionRate", conversionRate);

    console.log("activeDeals", activeDeals);

    if (
      leadCount !== undefined &&
      revenue !== undefined &&
      conversionRate !== undefined &&
      activeDeals !== undefined
    ) {
      console.log("w3w");
      return NextResponse.json(
        {
          data: {
            leadCount,
            revenue,
            conversionRate,
            activeDeals,
            activitiesWithTimeAgo,
          },
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        {
          message: "Missing some dashboard data",
        },
        { status: 500 }
      );
    }

    //continue logic shits here
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
