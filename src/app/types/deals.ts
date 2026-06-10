import type {
  Deal,
  OrganizationUserRole,
  Prisma,
  User,
} from "@prisma/client";

export type ModalPurpose = "add" | "edit" | "";
export type statusStrings = "pending" | "won" | "lost" | "";

export type StatusTypes = {
  key: string;
  label: string;
};

export type RawDeal = Omit<
  Pick<Deal, "id" | "name" | "amount" | "status" | "updatedAt">,
  "amount"
> & {
  amount: Prisma.Decimal | number | string;
  owner: Pick<User, "id" | "name">;
};

export type DealFormTypes = {
  name: string;
  amount: number;
  status: statusStrings;
  owner: string;
  id?: string;
  lastInteraction?: string;
  ownerId?: string;
  dealId?: string;
};

export type DealFormErrorTypes = {
  nameError: string;
  amountError: string;
  statusError: string;
  ownerError: string;
};

export type DealsDataTypes = {
  amount: number;
  id: string;
  lastInteraction: string;
  name: string;
  owner: string;
  ownerId: string;
  status: statusStrings;
};

export type DealsApiResponse = {
  formatedDealsData: DealsDataTypes[];
  userRole: string;
};

export type AddDealTypes = {
  amount: number;
  name: string;
  selectedOrg: string;
  status: statusStrings;
  userid: string;
};

export type UpdateDealTypes = {
  amount: number;
  dealId: string;
  name: string;
  ownerId: string;
  selectedOrg: string;
  status: statusStrings;
};

export type Users = {
  id: string;
  name: string;
};

export type FilteredUserWithRole = {
  agentList: Users[];
  minerList: Users[];
};

export type FilterOrgUsersDataTypes = {
  role: OrganizationUserRole;
  user: Pick<User, "name" | "id">;
};

export type DeleteDealTypes = {
  id: string;
  selectedOrg: string;
};
