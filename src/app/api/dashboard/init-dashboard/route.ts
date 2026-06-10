import { NextResponse, NextRequest } from "next/server";
import prismaInstance from "@/app/lib/prismaInstance";
import { getOrgMembership } from "@/app/lib/routeAuth";
import { formatDistanceToNow } from "date-fns";
import { DealStatus, LeadStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const selectedOrg = searchParams.get("selectedOrg");

    if (!selectedOrg) {
      return NextResponse.json(
        { error: "selectedOrg is required" },
        { status: 400 }
      );
    }

    const auth = await getOrgMembership(req, selectedOrg);

    if ("response" in auth) return auth.response;

    const [leadCount, convertedLeadCount, activeDeals, wonRevenue, activities] =
      await Promise.all([
        prismaInstance.lead.count({
          where: { organizationId: selectedOrg },
        }),
        prismaInstance.lead.count({
          where: { organizationId: selectedOrg, status: LeadStatus.CONVERTED },
        }),
        prismaInstance.deal.count({
          where: { organizationId: selectedOrg, status: DealStatus.PENDING },
        }),
        prismaInstance.deal.aggregate({
          where: { organizationId: selectedOrg, status: DealStatus.WON },
          _sum: { amount: true },
        }),
        prismaInstance.activity.findMany({
          where: {
            organizationId: selectedOrg,
          },
          select: {
            id: true,
            description: true,
            date: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            lead: {
              select: {
                id: true,
                name: true,
              },
            },
            deal: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
          take: 8,
        }),
      ]);

    const conversionRate =
      leadCount > 0 ? (convertedLeadCount / leadCount) * 100 : 0;
    const revenue = wonRevenue._sum.amount?.toString() ?? "0";

    const activitiesWithTimeAgo = activities.map((activity) => ({
      ...activity,
      timeAgo: formatDistanceToNow(activity.date, { addSuffix: true }),
    }));

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
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
