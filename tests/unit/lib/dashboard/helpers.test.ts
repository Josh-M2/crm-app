import { describe, expect, it } from "vitest";
import {
  formatActivitiesFromApi,
  formatStatsFromApi,
} from "@/app/lib/dashboard/helpers";
import type { DashboardApiResponse } from "@/app/types/dashboard";

const dashboardResponse: DashboardApiResponse = {
  data: {
    activeDeals: 3,
    conversionRate: 33.3333,
    leadCount: 12,
    revenue: "24500",
    activitiesWithTimeAgo: [
      {
        id: "activity-1",
        description: "Created deal Enterprise plan",
        date: "2026-06-10T00:00:00.000Z",
        deal: { id: "deal-1", name: "Enterprise plan" },
        lead: null,
        user: { id: "user-1", name: "Jane", email: "jane@example.com" },
        timeAgo: "5 minutes ago",
      },
      {
        id: "activity-2",
        description: "Deleted lead Old lead",
        date: "2026-06-09T00:00:00.000Z",
        deal: null,
        lead: null,
        user: { id: "user-2", name: null, email: "sam@example.com" },
        timeAgo: "1 day ago",
      },
    ],
  },
};

describe("dashboard helpers", () => {
  it("formats dashboard stats for stat cards", () => {
    expect(formatStatsFromApi(dashboardResponse)).toEqual([
      { title: "Total Leads", value: 12 },
      { title: "Active Deals", value: 3 },
      { title: "Conversion Rate", value: "33.33%" },
      { title: "Revenue", value: "$24,500" },
    ]);
  });

  it("formats activities for the recent activity list", () => {
    expect(formatActivitiesFromApi(dashboardResponse)).toEqual([
      {
        id: "activity-1",
        description: "Created deal Enterprise plan",
        userName: "Jane",
        timeAgo: "5 minutes ago",
      },
      {
        id: "activity-2",
        description: "Deleted lead Old lead",
        userName: "Unknown user",
        timeAgo: "1 day ago",
      },
    ]);
  });
});
