import type {
  Activity as PrismaActivity,
  Deal,
  Lead,
  User,
} from "@prisma/client";

export type ActivityTypes = {
  id: string;
  description: string;
  userName: string;
  timeAgo: string;
};

export type StatsTypes = {
  title: string;
  value: string | number;
};

export type DashboardApiResponse = {
  data: {
    activeDeals: number;
    conversionRate: number;
    leadCount: number;
    revenue: string;
    activitiesWithTimeAgo: ActivityWithTimeAgo[];
  };
};

export type ActivityWithTimeAgo = PrismaActivity & {
  deal: Deal | null;
  lead: Lead | null;
  user: User;
  timeAgo: string;
};
