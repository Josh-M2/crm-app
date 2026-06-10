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
    activitiesWithTimeAgo: Activity[];
  };
};

export type Activity = {
  id: string;
  description: string;
  date: string; // ISO date string
  dealId: string | null;
  deal: any | null; // You can define this more specifically if needed
  leadId: string;
  leadCategoryId: string | null;
  lead: Lead;
  organizationId: string;
  userId: string;
  user: User;
  timeAgo: string;
};

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  status: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: string; // ISO date string
}
