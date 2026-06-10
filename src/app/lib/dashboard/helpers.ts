import {
  StatsTypes,
  ActivityTypes,
  DashboardApiResponse,
} from "@/app/types/dashboard";

export const formatStatsFromApi = (
  data: DashboardApiResponse
): StatsTypes[] => [
  { title: "Total Leads", value: data.data.leadCount || 0 },
  { title: "Active Deals", value: data.data.activeDeals || 0 },
  {
    title: "Conversion Rate",
    value: `${data.data.conversionRate?.toFixed(2)}%`,
  },
  { title: "Revenue", value: `$${Number(data.data.revenue).toLocaleString()}` },
];

export const formatActivitiesFromApi = (
  data: DashboardApiResponse
): ActivityTypes[] =>
  data.data.activitiesWithTimeAgo.map((activity) => ({
    id: activity.id,
    description: activity.description,
    userName: activity.user.name ?? "Unknown user",
    timeAgo: activity.timeAgo,
  }));
