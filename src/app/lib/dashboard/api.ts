import axiosInstance from "@/app/lib/axiosInstance";
import { DashboardApiResponse } from "@/app/types/dashboard";

export const fetchDashboardData = async (
  refData: string
): Promise<DashboardApiResponse> => {
  const [, email, selectedOrg] = refData.split("::");
  const response = await axiosInstance.get("/dashboard/init-dashboard", {
    params: { email, selectedOrg },
  });

  if (response?.data.error) {
    throw new Error(`Error: ${response.data.error.status}`);
  }

  return response?.data;
};
