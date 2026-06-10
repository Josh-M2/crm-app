export type RevenueOverTimePoint = {
  month: string;
  revenue: number;
};

export type LeadsByStatusPoint = {
  name: string;
  value: number;
};

export type MonthlyNewLeadsPoint = {
  month: string;
  newLeads: number;
};

export type AnalyticsApiResponse = {
  data: {
    revenueOverTime: RevenueOverTimePoint[];
    leadsByStatus: LeadsByStatusPoint[];
    monthlyNewLeads: MonthlyNewLeadsPoint[];
  };
};
