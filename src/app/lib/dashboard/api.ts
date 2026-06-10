import axiosInstance from "@/app/lib/axiosInstance";
import { DashboardApiResponse } from "@/app/types/dashboard";

export const fetchDashboardData = async (
  refData: string
): Promise<DashboardApiResponse> => {
  const [, selectedOrg] = refData.split("::");
  const response = await axiosInstance.get("/dashboard/init-dashboard", {
    params: { selectedOrg },
  });

  if (response?.data.error) {
    throw new Error(response.data.error);
  }

  return response?.data;
};
