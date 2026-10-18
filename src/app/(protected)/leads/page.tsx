"use client";

import React, { useMemo, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SetUpOrg from "@/app/components/SetUpOrg";
import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/app/components/ProtectedPageSkeleton";
import { useOrganization } from "@/app/context/OrganizationContext";
import { inputChange } from "@/app/lib/inputChange";
import useSWR from "swr";
import axiosInstance from "@/app/lib/axiosInstance";
import { getApiErrorMessage } from "@/app/lib/apiError";
import useSWRMutation from "swr/mutation";
import Image from "next/image";
import type { LeadCategory, OrganizationUserRole, User } from "@prisma/client";

type UserPreview = Pick<User, "id" | "name" | "email">;
type LeadCategoryWithUsers = Pick<LeadCategory, "id" | "name"> & {
  owner: UserPreview | null;
  assignedTo: UserPreview | null;
};
type FormattedCategorizedLead = {
  id: string;
  leadName: string;
  ownerId: string;
  owner: string;
  ownerEmail: string;
  assignedtoId: string;
  assignedto: string;
  assignedtoEmail: string;
};
type OrgUserWithRole = {
  role: OrganizationUserRole;
  user: Pick<User, "id" | "name">;
};
type OrgUserOption = Pick<User, "id" | "name">;
type FilteredLeadUsers = {
  agentList: OrgUserOption[];
  minerList: OrgUserOption[];
};
type CategorizedLeadsResponse = {
  formatedcategorizedLeadsData: FormattedCategorizedLead[];
  userRole: OrganizationUserRole;
};
type ApiErrorResponse = {
  error?: string | { status?: number };
};
type LeadCategoryForm = {
  name: string;
  owner: string;
  assignedTo: string;
};
type LeadCategoryFormError = {
  nameError: string;
  ownerError: string;
  assignedToError: string;
};
type DeleteCategorizedLeadArg = {
  id: string;
  selectedOrg: string;
};

type LeadColumnKey = keyof Pick<
  FormattedCategorizedLead,
  "leadName" | "owner" | "assignedto"
>;
type TableColumnDefinition = {
  key: LeadColumnKey | "actions";
  label: string;
};

// Columns definition for the table
const columns: TableColumnDefinition[] = [
  {
    key: "leadName",
    label: "LIST NAME",
  },
  {
    key: "owner",
    label: "OWNER",
  },
  {
    key: "assignedto",
    label: "ASSIGNED USER",
  },
  {
    key: "actions",
    label: "ACTIONS",
  },
];

const handleFetchCategorizedLeadsData = async (
  refData: string,
): Promise<CategorizedLeadsResponse | null> => {
  console.log("handleFetchCategorizedLeadsDataRefdata", refData);
  if (!refData) return null;

  const [, email, selectedOrg] = refData.split("::");
  const respone = await axiosInstance.get<
    ApiErrorResponse & {
      categorizedLeads: LeadCategoryWithUsers[];
      userRole: { role: OrganizationUserRole };
    }
  >("/leads/manage-lead-category/fetch-organization-leads", {
    params: {
      email,
      selectedOrg,
    },
  });
  if (respone.data.error) throw new Error(`error: ${respone.data.error}`);
  console.log(
    "handleFetchCategorizedLeadsData ",
    respone.data.categorizedLeads,
  );

  console.log("handleFetchCategorizedLeadsData ", respone.data.userRole);

  const formatedcategorizedLeadsData = formatLeadsData(
    respone.data.categorizedLeads,
  );
  console.log("formatedcategorizedLeadsData ", formatedcategorizedLeadsData);
  return {
    formatedcategorizedLeadsData: formatedcategorizedLeadsData,
    userRole: respone.data.userRole.role,
  };
};

const formatLeadsData = (apiData: LeadCategoryWithUsers[]) => {
  console.log("apiData: ", apiData);
  return apiData.map((lead) => ({
    id: lead.id,
    leadName: lead.name,

    ownerId: lead.owner?.id || "Unknown",
    owner: lead.owner?.name || "Unknown",
    ownerEmail: lead.owner?.email || "Unknown",

    assignedtoId: lead.assignedTo?.id || "Unassigned",
    assignedto: lead.assignedTo?.name || "Unassigned",
    assignedtoEmail: lead.assignedTo?.email || "Unassigned",
  }));
};

const formatOrgUserDataLeadsAgent = (apiData: OrgUserWithRole[]) => {
  return apiData.map((lead) => ({
    id: lead.user.id,
    name: lead.user.name,
  }));
};

const filterLeadsData = (apiData: OrgUserWithRole[]): FilteredLeadUsers => {
  return {
    agentList: formatOrgUserDataLeadsAgent(
      apiData.filter((member) => member.role === "AGENT" || member.role === "ADMIN"),
    ),
    minerList: formatOrgUserDataLeadsAgent(
      apiData.filter((member) => member.role === "MINER" || member.role === "ADMIN"),
    ),
  };
};

const handleFetchOrgUserData = async (
  refData: string,
): Promise<FilteredLeadUsers> => {
  if (!refData) {
    return { agentList: [], minerList: [] };
  }
  const [, selectedOrg] = refData.split("::");

  const response = await axiosInstance.get<
    ApiErrorResponse & { orgUser: OrgUserWithRole[] }
  >("/organization/fetch-org-users", {
    params: {
      selectedOrg: selectedOrg,
    },
  });

  if (response?.data.error) {
    throw new Error(`Error: ${response.data.error}`);
  }

  console.log("handleFetchOrgUserData123: ", response.data);

  const filteredLeadsData = filterLeadsData(response.data.orgUser);

  console.log("filteredLeadsData: ", filteredLeadsData);

  return filteredLeadsData;
};

const sendRequestToDeleteCategorizedLead = async (
  url: string,
  { arg }: { arg: DeleteCategorizedLeadArg },
) => {
  console.log("url: ", url);
  console.log("arg: ", arg);
  const response = await axiosInstance.post(url, arg);
  if (response.data.error) throw new Error(`error: ${response.data.error}`);
  console.log("deletedData: ", response.data);
  return "ok";
};

export default function LeadsPage() {
  const componentName = useMemo(() => "LeadsPage", []);
  const errorImageURL = useMemo(() => "/circle-exclamation-solid.svg", []);

  const { data: session, status } = useSession();

  const { selectedOrg, organizations, isLoading } = useOrganization();
  const selectedOrgData = organizations.find(
    (org) => org.organization.id === selectedOrg,
  );
  const [actionError, setActionError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const [form, setForm] = useState<LeadCategoryForm>({
    name: "",
    owner: "",
    assignedTo: "",
  });

  const [error, setError] = useState<LeadCategoryFormError>({
    nameError: "",
    ownerError: "",
    assignedToError: "",
  });

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onOpenChange: onAddOpenChange,
  } = useDisclosure();

  // Handle edit action for a specific lead
  const handleEditLead = (ownerId: string, leadName: string) => {
    // Implement the edit functionality here (e.g., navigate to edit page)
    console.log("Editing lead with ID:", ownerId, leadName);
    if (leadName && ownerId) {
      router.push(`/leads/${ownerId}?leadName=${encodeURIComponent(leadName)}`);
    }
  };

  // Utility function to get values from each row based on the column key
  const getKeyValue = (
    item: FormattedCategorizedLead,
    columnKey: LeadColumnKey,
  ) => {
    const value = item[columnKey];
    const isAssignedToCurrentUser =
      columnKey === "assignedto" &&
      item.assignedtoEmail === session?.user?.email;

    return `${value}${isAssignedToCurrentUser ? " (me)" : ""}` || "-";
  };

  const handleAddCategorizedLead = async (
    selectedOrg: string,
    form: LeadCategoryForm,
    canAssignUser: boolean,
    onClose: () => void,
  ) => {
    setActionError("");
    if (!form.name.trim() || !form.owner || (canAssignUser && !form.assignedTo)) {
      setActionError(
        canAssignUser
          ? "Enter a list name, owner, and assigned user."
          : "Enter a list name and owner.",
      );
      return;
    }

    setIsAdding(true);
    try {
      await axiosInstance.post("/leads/manage-lead-category/add-categorized-lead", {
        selectedOrg,
        categoryName: form.name,
        ownerId: form.owner,
        assignedUserId: canAssignUser ? form.assignedTo : undefined,
      });
      await refreshCategorizedLeads();
      onClose();
      setForm({ name: "", owner: "", assignedTo: "" });
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Unable to add the lead list."));
    } finally {
      setIsAdding(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    console.log("value: ", e.target.value);
    console.log("target: ", e);
    inputChange({ e, setForm, setError, form, componentName });
  };

  const leadsKey =
    session?.user?.email && selectedOrg
      ? `fetch-leads-data::${session.user.email}::${selectedOrg}`
      : null;

  const { data: categorizedLeads, error: leadsError, isLoading: isLoadingcategorizedLeads, mutate: refreshCategorizedLeads } =
    useSWR(leadsKey ? leadsKey : null, handleFetchCategorizedLeadsData, {
      revalidateOnMount: true,
      dedupingInterval: 60000,
      revalidateOnFocus: false,
    });

  const manageOrgUserKey =
    session?.user?.email && selectedOrg
      ? `fetch-org-user::${selectedOrg}`
      : null;

  const { data: manageOrgUserData, error: orgUsersError } = useSWR(
    manageOrgUserKey ? manageOrgUserKey : null,
    handleFetchOrgUserData,
    {
      dedupingInterval: 60000,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      // onError: (err) => {
      //   console.error("Error fetching dashboard data:", err);
      // },
    },
  );

  const { trigger: triggerDeleteCategorizedLead } = useSWRMutation(
    "/leads/manage-lead-category/delete-categorized-lead",
    sendRequestToDeleteCategorizedLead,
  );

  const handleDeleteCategorizedLead = async (id: string) => {
    setActionError("");
    setDeletingId(id);
    try {
      await triggerDeleteCategorizedLead({ id, selectedOrg: selectedOrg as string });
      await refreshCategorizedLeads();
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Unable to delete the lead list."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {status === "loading" || isLoading ? (
        <div className="">
          <PageHeaderSkeleton hasAction />
          <TableSkeleton columns={4} />
        </div>
      ) : selectedOrg ? (
        <>
          <div className="">
            {/* Leads title and Add new lead button */}
            <div className="flex justify-between mb-4">
              <h2 className="text-3xl font-bold">Leads</h2>
              <Button color="primary" onPress={() => { setActionError(""); onAddOpen(); }}>
                Add Lead List
              </Button>
            </div>
            {actionError && !isAddOpen && (
              <p role="alert" className="mb-4 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {actionError}
              </p>
            )}
          </div>

          {/* Table to display leads */}
          {isLoadingcategorizedLeads ? (
            <TableSkeleton className="" columns={4} />
          ) : leadsError ? (
            <p role="alert" className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              Unable to load lead lists. Please try again.
            </p>
          ) : categorizedLeads?.formatedcategorizedLeadsData.length ? (
            <Table aria-label="oraganization categorized leads">
              <TableHeader columns={columns}>
                {(column) => (
                  <TableColumn key={column.key} className="text-center">
                    {column.label}
                  </TableColumn>
                )}
              </TableHeader>

              <TableBody items={categorizedLeads.formatedcategorizedLeadsData}>
                {(item) => (
                  <TableRow key={item.id}>
                    {columns.map((column) => (
                      <TableCell key={column.key} className="text-center">
                        {column.key === "actions" ? (
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="light"
                              onPress={() =>
                                handleEditLead(item.id, item.leadName)
                              }
                            >
                              Edit/View
                            </Button>
                            {categorizedLeads?.userRole === "ADMIN" && (
                              <Button
                                size="sm"
                                variant="light"
                                color="danger"
                                isLoading={deletingId === item.id}
                                // onPress={() => handleDeleteLead(item.id)}
                                onPress={() => handleDeleteCategorizedLead(item.id)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        ) : (
                          getKeyValue(item, column.key as LeadColumnKey)
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <div className=" rounded-lg border border-gray-200 bg-white p-6 text-gray-600">
              No lead lists yet.
            </div>
          )}
        </>
      ) : (
        <SetUpOrg />
      )}

      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add Lead List</ModalHeader>
              <ModalBody>
                {orgUsersError && (
                  <p role="alert" className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    Unable to load organization users. Please try again.
                  </p>
                )}
                {actionError && (
                  <p role="alert" className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {actionError}
                  </p>
                )}
                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddCategorizedLead(
                      selectedOrg as string,
                      form,
                      selectedOrgData?.role === "ADMIN",
                      onClose,
                    );
                  }}
                >
                  <div>
                    <Input
                      isRequired
                      label="List name"
                      type="text"
                      id="name"
                      name="name"
                      color={error.nameError ? "danger" : "default"}
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>
                  {error.nameError && (
                    <label className="flex items-center !mt-1 text-rose-600 text-xs">
                      <Image
                        src={errorImageURL}
                        alt="error exclamatory"
                        width={12}
                        height={12}
                        className="mr-1"
                      />
                      {error.nameError}
                    </label>
                  )}
                  <div>
                    <Select
                      isRequired
                      className="max-w-xs"
                      label="Owner"
                      name="owner"
                      selectedKeys={[form.owner]}
                      onChange={handleChange}
                    >
                      {(manageOrgUserData?.agentList ?? []).map((agent) => (
                        <SelectItem key={agent.id}>{agent.name}</SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Select
                      isRequired={selectedOrgData?.role === "ADMIN"}
                      isDisabled={selectedOrgData?.role !== "ADMIN"}
                      className="max-w-xs"
                      label="Assigned user"
                      name="assignedTo"
                      selectedKeys={[form.assignedTo]}
                      placeholder={
                        selectedOrgData?.role === "ADMIN"
                          ? "Select a member"
                          : `${session?.user?.name ?? "You"} (Me)`
                      }
                      onChange={handleChange}
                    >
                      {(manageOrgUserData?.minerList ?? []).map((miner) => (
                        <SelectItem key={miner.id}>{miner.name}</SelectItem>
                      ))}
                    </Select>
                  </div>
                  <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button color="primary" type="submit" isLoading={isAdding}>
                      {isAdding ? "Adding..." : "Confirm"}
                    </Button>
                  </ModalFooter>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
