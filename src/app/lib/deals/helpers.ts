import {
  DealsDataTypes,
  FilterOrgUsersDataTypes,
  Users,
  RawDeal,
} from "@/app/types/deals";

export const capitalizeStatus = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

const formatDealStatus = (status: RawDeal["status"]): "pending" | "won" | "lost" => {
  return status.toLowerCase() as "pending" | "won" | "lost";
};

export const dealsDataFormatter = (apiData: RawDeal[]): DealsDataTypes[] => {
  return apiData.map((lead) => ({
    id: lead.id,
    name: lead.name,
    amount: Number(lead.amount) || 0,
    status: formatDealStatus(lead.status),
    owner: lead.owner?.name ?? "Unknown",
    ownerId: lead.owner?.id ?? "Unknown",
    lastInteraction:
      lead.updatedAt instanceof Date
        ? lead.updatedAt.toISOString().split("T")[0]
        : String(lead.updatedAt).split("T")[0],
  }));
};

export const filterOrgUsersData = (
  apiData: FilterOrgUsersDataTypes[]
): { agentList: Users[]; minerList: Users[] } => {
  const format = (list: FilterOrgUsersDataTypes[]) =>
    list.map((user) => ({ id: user.user.id, name: user.user.name ?? "Unknown user" }));

  return {
    agentList: format(apiData.filter((u) => u.role === "AGENT")),
    minerList: format(apiData.filter((u) => u.role === "MINER")),
  };
};
