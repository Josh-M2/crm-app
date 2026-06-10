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

export type DashboardUser = {
  id: string;
  email: string;
  name: string | null;
};

export type DashboardRelation = {
  id: string;
  name: string;
};

export type ActivityWithTimeAgo = {
  id: string;
  description: string;
  date: string;
  deal: DashboardRelation | null;
  lead: DashboardRelation | null;
  user: DashboardUser;
  timeAgo: string;
};
