import prismaInstance from "@/app/lib/prismaInstance";
import { getOrgMembership } from "@/app/lib/routeAuth";
import { DealStatus, LeadStatus } from "@prisma/client";
import { format } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

const formatMonth = (date: Date) => format(date, "MMM yyyy");

const incrementMonthValue = (
  map: Map<string, number>,
  date: Date,
  amount = 1
) => {
  const month = formatMonth(date);
  map.set(month, (map.get(month) ?? 0) + amount);
};

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

    const [wonDeals, leads, leadsByStatus] = await Promise.all([
      prismaInstance.deal.findMany({
        where: {
          organizationId: selectedOrg,
          status: DealStatus.WON,
        },
        select: {
          amount: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "asc",
        },
      }),
      prismaInstance.lead.findMany({
        where: {
          organizationId: selectedOrg,
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
      prismaInstance.lead.groupBy({
        by: ["status"],
        where: {
          organizationId: selectedOrg,
        },
        _count: {
          status: true,
        },
      }),
    ]);

    const revenueByMonth = new Map<string, number>();
    const newLeadsByMonth = new Map<string, number>();

    wonDeals.forEach((deal) => {
      incrementMonthValue(
        revenueByMonth,
        deal.updatedAt,
        Number(deal.amount.toString())
      );
    });

    leads.forEach((lead) => {
      incrementMonthValue(newLeadsByMonth, lead.createdAt);
    });

    const revenueOverTime = Array.from(revenueByMonth, ([month, revenue]) => ({
      month,
      revenue,
    }));

    const monthlyNewLeads = Array.from(newLeadsByMonth, ([month, newLeads]) => ({
      month,
      newLeads,
    }));

    const leadsByStatusData = leadsByStatus.map((leadStatus) => ({
      name:
        leadStatus.status === LeadStatus.IN_PROGRESS
          ? "In Progress"
          : `${leadStatus.status.charAt(0)}${leadStatus.status
              .slice(1)
              .toLowerCase()}`,
      value: leadStatus._count.status,
    }));

    return NextResponse.json(
      {
        data: {
          revenueOverTime,
          leadsByStatus: leadsByStatusData,
          monthlyNewLeads,
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
