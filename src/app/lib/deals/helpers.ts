import {
  DealsDataTypes,
  FilterOrgUsersDataTypes,
  Users,
  RawDeal,
} from "@/app/types/deals";

export const capitalizeStatus = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

export const dealsDataFormatter = (apiData: RawDeal[]): DealsDataTypes[] => {
  return apiData.map((lead) => ({
    id: lead.id,
    name: lead.name,
    amount: Number(lead.amount) || 0,
    status: capitalizeStatus(lead.status) as "pending" | "won" | "lost",
    owner: lead.owner?.name ?? "Unknown",
    ownerId: lead.owner?.id ?? "Unknown",
    lastInteraction: lead.updatedAt?.split("T")[0] ?? "N/A",
  }));
};

export const filterOrgUsersData = (
  apiData: FilterOrgUsersDataTypes[]
): { agentList: Users[]; minerList: Users[] } => {
  const format = (list: FilterOrgUsersDataTypes[]) =>
    list.map((user) => ({ id: user.user.id, name: user.user.name }));

  return {
    agentList: format(apiData.filter((u) => u.role === "AGENT")),
    minerList: format(apiData.filter((u) => u.role === "MINER")),
  };
};
