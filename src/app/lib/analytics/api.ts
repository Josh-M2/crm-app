import axiosInstance from "@/app/lib/axiosInstance";
import { AnalyticsApiResponse } from "@/app/types/analytics";

export const fetchAnalyticsData = async (
  refData: string
): Promise<AnalyticsApiResponse> => {
  const [, selectedOrg] = refData.split("::");
  const response = await axiosInstance.get("/analytics/init-analytics", {
    params: { selectedOrg },
  });

  if (response?.data.error) {
    throw new Error(response.data.error);
  }

  return response.data;
};
