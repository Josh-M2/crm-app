import { StatusTypes } from "@/app/types/deals";

export const columns: StatusTypes[] = [
  { key: "name", label: "Deal Name" },
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status" },
  { key: "owner", label: "Owner" },
  {
    key: "lastInteraction",
    label: "last Interaction",
  },
  { key: "actions", label: "Actions" },
];

export const statusSelect: StatusTypes[] = [
  { key: "pending", label: "pending" },
  { key: "won", label: "won" },
  { key: "lost", label: "lost" },
];
