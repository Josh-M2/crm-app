import { NextResponse, NextRequest } from "next/server";
import prismaInstance from "@/app/lib/prismaInstance";
import { getOrgMembership } from "@/app/lib/routeAuth";
import { formatDistanceToNow } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const body = req.nextUrl.searchParams;
    const selectedOrg = body.get("selectedOrg");

    if (!selectedOrg) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const auth = await getOrgMembership(req, selectedOrg);

    if ("response" in auth) return auth.response;

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
    if (
      leadCount !== undefined &&
      revenue !== undefined &&
      conversionRate !== undefined &&
      activeDeals !== undefined
    ) {
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
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
