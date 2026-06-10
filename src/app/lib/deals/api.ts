import axiosInstance from "../axiosInstance";
import { DealsApiResponse } from "@/app/types/deals";
import { dealsDataFormatter, filterOrgUsersData } from "./helpers";

export const InitDealsData = async (
  refData: string
): Promise<DealsApiResponse> => {
  console.log("functioning: InitDealsData");
  const [, email, selectedOrg] = refData.split("::");

  const response = await axiosInstance.get("/deals/fetch-deals-data", {
    params: { email, selectedOrg },
  });

  if (response.data.error) throw new Error(response.data.error);

  return {
    formatedDealsData: dealsDataFormatter(response.data.dealsData),
    userRole: response.data.userRole.role,
  };
};

export const fetchOrgUserData = async (refData: string) => {
  console.log("functioning: fetchOrgUserData");
  if (!refData) {
    return console.error("no refData refData");
  }
  const [, selectedOrg] = refData.split("::");

  const response = await axiosInstance.get("/organization/fetch-org-users", {
    params: {
      selectedOrg: selectedOrg,
    },
  });

  if (response.data.error) throw new Error(`Error: ${response.data.error}`);

  console.log("handleFetchOrgUserData123: ", response.data);

  const filteredLeadsData = filterOrgUsersData(response.data.orgUser);

  console.log("filteredLeadsData: ", filteredLeadsData);

  return filteredLeadsData;
};
