"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { motion } from "framer-motion";
import Sidebar from "@/app/components/Sidebar";
import { useSession } from "next-auth/react";
import SetUpOrg from "@/app/components/SetUpOrg";
import { Organization, useOrganization } from "@/app/context/OrganizationContext";
import { inputChange } from "@/app/lib/inputChange";
import useSWR from "swr";
import axiosInstance from "@/app/lib/axiosInstance";
import useSWRMutation from "swr/mutation";
import Image from "next/image";
import type {
  LeadCategory,
  OrganizationUserRole,
  User,
} from "@prisma/client";

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
    label: "LEAD NAME",
  },
  {
    key: "owner",
    label: "OWNER",
  },
  {
    key: "assignedto",
    label: "Assigned To",
  },
  {
    key: "actions",
    label: "ACTIONS",
  },
];

const handleFetchCategorizedLeadsData = async (
  refData: string
): Promise<CategorizedLeadsResponse | null> => {
  console.log("handleFetchCategorizedLeadsDataRefdata", refData);
  if (!refData) return null;

  const [, email, selectedOrg] = refData.split("::");
  const respone = await axiosInstance.get<
    ApiErrorResponse & {
      categorizedLeads: LeadCategoryWithUsers[];
      userRole: { role: OrganizationUserRole };
    }
  >(
    "/leads/manage-lead-category/fetch-organization-leads",
    {
      params: {
        email,
        selectedOrg,
      },
    }
  );
  if (respone.data.error) throw new Error(`error: ${respone.data.error}`);
  console.log(
    "handleFetchCategorizedLeadsData ",
    respone.data.categorizedLeads
  );

  console.log("handleFetchCategorizedLeadsData ", respone.data.userRole);

  const formatedcategorizedLeadsData = formatLeadsData(respone.data.categorizedLeads);
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
  console.log("apiData:", apiData);
  console.log("filterName:", apiData[0]);

  const formated = apiData.map((lead) => ({
    id: lead.user.id,
    name: lead.user.name,
  }));
  console.log("formated:", formated);

  return formated;
};

const filterLeadsData = (apiData: OrgUserWithRole[]): FilteredLeadUsers => {
  const minerList = apiData
    .slice()
    .filter((lead) => lead.role === "MINER");
  const agentList = apiData
    .slice()
    .filter((lead) => lead.role === "AGENT");
  console.log("minerList: ", minerList);
  console.log("agentList: ", agentList);

  const formatedAgentList = formatOrgUserDataLeadsAgent(agentList);
  const formatedMinerList = formatOrgUserDataLeadsAgent(minerList);
  console.log("formatedAgentList: ", formatedAgentList);
  console.log("formatedMinerList: ", formatedMinerList);

  return {
    minerList: formatedMinerList ? formatedMinerList : [],
    agentList: formatedAgentList ? formatedAgentList : [],
  };
};

const handleFetchOrgUserData = async (
  refData: string
): Promise<FilteredLeadUsers> => {
  if (!refData) {
    return { agentList: [], minerList: [] };
  }
  const [, selectedOrg] = refData.split("::");

  const response = await axiosInstance.get<
    ApiErrorResponse & { orgUser: OrgUserWithRole[] }
  >(
    "/organization/fetch-org-users",
    {
      params: {
        selectedOrg: selectedOrg,
      },
    }
  );

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
  { arg }: { arg: DeleteCategorizedLeadArg }
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

  const { selectedOrg, organizations } = useOrganization();
  const [selectedOrgData, setSelectedOrgData] = useState<Organization>();
  const [isOpenSideBar, setIsOpenSideBar] = useState<boolean>(true);
  const toggleSidebar = () => setIsOpenSideBar((prev) => !prev);
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
      router.push(`/leads/${ownerId}?leadName=${leadName}`);
    }
  };

  // Utility function to get values from each row based on the column key
  const getKeyValue = (item: FormattedCategorizedLead, columnKey: LeadColumnKey) => {
    const value = item[columnKey];
    const isAssignedToCurrentUser =
      columnKey === "assignedto" && item.assignedtoEmail === session?.user?.email;

    return `${value}${isAssignedToCurrentUser ? " (me)" : ""}` || "-";
  };

  const handleAddCategorizedLead = async (
    selectedOrg: string,
    form: LeadCategoryForm,
    canAssignUser: boolean,
    onClose: () => void
  ) => {
    console.log("handleAddCategorizedLead: ", selectedOrg);

    console.log("handleAddCategorizedLead: ", form);

    const response = await axiosInstance.post(
      "/leads/manage-lead-category/add-categorized-lead",
      {
        selectedOrg: selectedOrg,
        categoryName: form.name,
        ownerId: form.owner,

        //if user is not admin automatically set the assigned to the current miner who create the organized lead
        email: canAssignUser ? form.assignedTo : session?.user?.email,
      }
    );

    if (response.data.error) throw new Error(`error: ${response.data.error}`);

    console.log(
      "handleAddCategorizedLead aded result: ",
      handleAddCategorizedLead
    );

    if (onClose) console.log("closemodal: ", onClose);
    onClose();
    setForm({
      name: "",
      owner: "",
      assignedTo: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    console.log("value: ", e.target.value);
    console.log("target: ", e);
    inputChange({ e, setForm, setError, form, componentName });
  };

  useEffect(() => {
    console.log("form: ", form.name);
  }, [form.name]);

  //should fetch datas of selected Organization
  useEffect(() => {
    if (selectedOrg && organizations) {
      console.log("runs");
      console.log("selectedOrg: ", selectedOrg);
      console.log("organizations: ", organizations);

      //return a copy of selected organization
      const orgData = organizations
        .slice()
        .filter((org) => org.organization.id === selectedOrg);
      if (orgData) {
        console.log("orgData: ", orgData[0]);

        setSelectedOrgData(orgData[0]);
      }
    }
  }, [organizations, selectedOrg]);

  useEffect(() => {
    if (selectedOrgData) console.log("leadSelectedOrgData: ", selectedOrgData);
  }, [selectedOrgData]);

  const leadsKey =
    session?.user?.email && selectedOrg
      ? `fetch-leads-data::${session.user.email}::${selectedOrg}`
      : null;

  const {
    data: categorizedLeads,
    isLoading: isLoadingcategorizedLeads,
  } = useSWR(leadsKey ? leadsKey : null, handleFetchCategorizedLeadsData, {
    revalidateOnMount: true,
    dedupingInterval: 60000,
    revalidateOnFocus: false,
  });

  const manageOrgUserKey =
    session?.user?.email && selectedOrg
      ? `fetch-org-user::${selectedOrg}`
      : null;

  const {
    data: manageOrgUserData,
  } = useSWR(
    manageOrgUserKey ? manageOrgUserKey : null,
    handleFetchOrgUserData,
    {
      dedupingInterval: 60000,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      // onError: (err) => {
      //   console.error("Error fetching dashboard data:", err);
      // },
    }
  );

  const {
    trigger: triggerDeleteCategorizedLead,
  } = useSWRMutation(
    "/leads/manage-lead-category/delete-categorized-lead",
    sendRequestToDeleteCategorizedLead
  );

  if (status === "loading") return "loading";

  return (
    <div className="min-h-screen flex bg-gray-50">
      <motion.div
        className="bg-gray-800 text-white w-64 h-full fixed top-0 left-0 z-30 transition-all duration-300"
        initial={{ x: -256 }} // Start hidden on the left
        animate={{ x: isOpenSideBar ? 0 : -256 }} // Slide in/out based on isOpen state
        exit={{ x: -256 }} // Same for exit animation
        transition={{ duration: 0.01 }} // Smooth transition settings
      >
        <Sidebar toggleSideBar={toggleSidebar} />
      </motion.div>

      <motion.main
        className="flex flex-col w-full p-8 container mx-auto p-6"
        animate={{ marginLeft: isOpenSideBar ? "16rem" : "0" }} // smooth transition of margin-left (lg:ml-64)
        transition={{ duration: 0.2 }} // Set transition duration for smooth effect
      >
        {selectedOrg ? (
          <>
            <div className="ml-10">
              <h2 className="text-3xl font-semibold mb-6 ">Leads</h2>

              {/* Leads title and Add new lead button */}
              <div className="flex justify-between mb-4">
                <h3 className="text-xl font-bold">
                  Leads for All Owners
                </h3>
                <Button color="primary" onPress={onAddOpen}>
                  Add New Owner
                </Button>
              </div>
            </div>

            {/* Table to display leads */}
            {isLoadingcategorizedLeads
              ? "loading"
              : categorizedLeads && (
                  <Table aria-label="oraganization categorized leads">
                    <TableHeader columns={columns}>
                      {(column) => (
                        <TableColumn key={column.key} className="text-center">
                          {column.label}
                        </TableColumn>
                      )}
                    </TableHeader>

                    <TableBody
                      items={categorizedLeads.formatedcategorizedLeadsData}
                    >
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
                                      // onPress={() => handleDeleteLead(item.id)}
                                      onPress={() =>
                                        triggerDeleteCategorizedLead({
                                          id: item.id,
                                          selectedOrg,
                                        })
                                      }
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
                )}
          </>
        ) : (
          <SetUpOrg />
        )}
      </motion.main>
      <button
        onClick={toggleSidebar}
        className={`absolute top-4 left-4 bg-transparent hover:bg-gray-300 py-2 px-4 rounded-md z-10 ${
          isOpenSideBar ? "hidden" : ""
        }`}
      >
        =
      </button>

      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add New categorized Lead</ModalHeader>
              <ModalBody>
                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddCategorizedLead(
                      selectedOrg as string,
                      form,
                      selectedOrgData?.role === "ADMIN",
                      onClose
                    );
                  }}
                >
                  <div>
                    <Input
                      // isRequired
                      label="Lead Name"
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
                      // isRequired
                      className="max-w-xs"
                      label="Select an Agent"
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
                      isDisabled={
                        categorizedLeads?.userRole !== "ADMIN" &&
                        categorizedLeads?.userRole === "MINER"
                      }
                      className="max-w-xs"
                      label="Assigned to"
                      name="assignedTo"
                      selectedKeys={[form.assignedTo]}
                      placeholder={
                        categorizedLeads?.userRole !== "ADMIN" &&
                        categorizedLeads?.userRole === "MINER"
                          ? `${session?.user?.name} (Me)`
                          : ""
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
                    <Button
                      color="primary"
                      type="submit"
                      // onPress={handleAddCategorizedLead(selectedOrg, form)}
                    >
                      Confirm
                    </Button>
                  </ModalFooter>
                </form>
              </ModalBody>
              {/* <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose}>
                  Add Deal
                </Button>
              </ModalFooter> */}
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
