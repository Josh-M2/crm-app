"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Input,
  Link,
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
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "@/app/components/Sidebar";
import { useSession } from "next-auth/react";
import SetUpOrg from "@/app/components/SetUpOrg";
import {
  Organization,
  useOrganization,
} from "@/app/context/OrganizationContext";
import { inputChange } from "@/lib/inputChange";
import useSWR, { mutate } from "swr";
import axiosInstance from "@/lib/axiosInstance";
import useSWRMutation from "swr/mutation";
import axios from "axios";

// Dummy lead data
const leadsData = [
  {
    id: "asdasdasd",
    owner: "John Doe",
    leadName: "Lead A",
    assignedto: "Kathy",
  },
  {
    id: "asdkh12",
    owner: "Jane Smith",
    leadName: "Lead B",
    assignedto: "Kathy",
  },
  {
    id: "asdasdasd3213",
    owner: "John Doe",
    leadName: "Lead C",
    assignedto: "Me",
  },
  // ... more leads
];

// Columns definition for the table
const columns = [
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

export const animals = [
  { key: "cat", label: "Cat" },
  { key: "dog", label: "Dog" },
  { key: "elephant", label: "Elephant" },
  { key: "lion", label: "Lion" },
  { key: "tiger", label: "Tiger" },
  { key: "giraffe", label: "Giraffe" },
  { key: "dolphin", label: "Dolphin" },
  { key: "penguin", label: "Penguin" },
  { key: "zebra", label: "Zebra" },
  { key: "shark", label: "Shark" },
  { key: "whale", label: "Whale" },
  { key: "otter", label: "Otter" },
  { key: "crocodile", label: "Crocodile" },
];

const handleFetchCategorizedLeadsData = async (refData: string) => {
  if (!refData) return;

  const [_, email, selectedOrg] = refData.split("::");
  const respone = await axiosInstance.get("/leads/fetch-organization-leads", {
    params: {
      email,
      selectedOrg,
    },
  });
  if (respone.data.error) throw new Error("error: ", respone.data.error);
  console.log(
    "handleFetchCategorizedLeadsData ",
    respone.data.categorizedLeads
  );

  console.log("handleFetchCategorizedLeadsData ", respone.data.userRole);

  const formatedcategorizedLeadsData = formatLeadsData(
    respone.data.categorizedLeads
  );
  console.log("formatedcategorizedLeadsData ", formatedcategorizedLeadsData);
  return {
    formatedcategorizedLeadsData: formatedcategorizedLeadsData,
    userRole: respone.data.userRole.role,
  };
};

const formatLeadsData = (apiData: []) => {
  console.log("apiData: ", apiData);
  return apiData.map((lead: any) => ({
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

const formatOrgUserDataLeadsAgent = (apiData: any) => {
  console.log("apiData:", apiData);
  console.log("filterName:", apiData[0]);

  const formated = apiData.map((lead: any) => ({
    id: lead.user.id,
    name: lead.user.name,
  }));
  console.log("formated:", formated);

  return formated;
};

const filterLeadsData = (apiData: []) => {
  const minerList = apiData
    .slice()
    .filter((lead: any) => lead.role === "MINER");
  const agentList = apiData
    .slice()
    .filter((lead: any) => lead.role === "AGENT");
  console.log("minerList: ", minerList);
  console.log("agentList: ", agentList);

  const formatedAgentList = formatOrgUserDataLeadsAgent(agentList);
  const formatedMinerList = formatOrgUserDataLeadsAgent(minerList);
  console.log("formatedAgentList: ", formatedAgentList);
  console.log("formatedMinerList: ", formatedMinerList);

  return {
    minerList: formatedAgentList ? formatedAgentList : [],
    agentList: formatedMinerList ? formatedMinerList : [],
  };
};

const handleFetchOrgUserData = async (refData: string) => {
  if (!refData) {
    return console.error("no refData refData");
  }
  const [_, selectedOrg] = refData.split("::");

  const response = await axiosInstance.get("/organization/fetch-org-users", {
    params: {
      selectedOrg: selectedOrg,
    },
  });

  if (response?.data.error) {
    throw new Error(`Error: ${response.data.error.status}`);
  }

  console.log("handleFetchOrgUserData123: ", response.data);

  const filteredLeadsData = filterLeadsData(response.data.orgUser);

  console.log("filteredLeadsData: ", filteredLeadsData);

  return filteredLeadsData;
};

export default function LeadsPage() {
  const componentName = useMemo(() => "LeadsPage", []);
  const errorImageURL = useMemo(() => "/circle-exclamation-solid.svg", []);

  const { data: session, status } = useSession();
  //avoid fkcing hydration
  const [initLeadsDataLoading, setInitLeadsDataLoading] =
    useState<boolean>(true);

  //to add types
  const [initLeadsData, setInitLeadsData] = useState<any>(null);

  const { selectedOrg, organizations } = useOrganization();
  const [selectedOrgData, setSelectedOrgData] = useState<any>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);
  const [isOpenSideBar, setIsOpenSideBar] = useState<boolean>(true);
  const toggleSidebar = () => setIsOpenSideBar((prev) => !prev);
  const router = useRouter();
  const pathname = usePathname();
  const [form, setForm] = useState<any>({
    name: "",
    owner: "",
    assignedTo: "",
  });

  const [error, setError] = useState<any>({
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
  const handleEditLead = (ownerId: string, owner: string) => {
    // Implement the edit functionality here (e.g., navigate to edit page)
    console.log("Editing lead with ID:", ownerId, owner);
    if (owner && ownerId) {
      router.push(`/leads/${ownerId}?owner=${owner}`);
    }
  };

  // Handle delete action for a specific lead
  const handleDeleteLead = (id: string) => {
    // Implement the delete functionality here (e.g., remove lead from list)
    console.log("Deleting lead with ID:", id);
  };

  // Utility function to get values from each row based on the column key
  const getKeyValue = (item: any, columnKey: string) => {
    // console.log("item: ", item);
    // console.log("columnKey: ", columnKey);
    // console.log("session?.user?.email ", session?.user?.email);

    return (
      `${item[columnKey]} ${
        columnKey === "assignedto" &&
        item.assignedtoEmail === session?.user?.email
          ? "(me)"
          : ""
      }` || "-"
    ); // Return value of the lead property or "-" if not available
  };

  const handleAddCategorizedLead = async (
    selectedOrg: string,
    form: any,
    isAdmin: boolean,
    onClose: () => void
  ) => {
    console.log("isAdmin: ", isAdmin);
    console.log("handleAddCategorizedLead: ", selectedOrg);

    console.log("handleAddCategorizedLead: ", form);

    const response = await axiosInstance.post("/leads/add-categorized-lead", {
      selectedOrg: selectedOrg,
      categoryName: form.name,
      ownerId: form.owner,

      //if user is not admin automatically set the assigned to the current miner who create the organized lead
      email: !isAdmin ? session?.user?.email : form.assignedTo,

      //for dynamic sht
      isAdmin,
    });

    if (response.data.error) throw new Error("error: ", response.data.error);

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
    console.log("form: ", form.leadName);
  }, [form.leadName]);

  //should fetch datas of selected Organization
  useEffect(() => {
    if (selectedOrg && organizations) {
      console.log("runs");
      console.log("selectedOrg: ", selectedOrg);
      console.log("organizations: ", organizations);

      //return a copy of selected organization
      const orgData = organizations
        .slice()
        .filter((org: any) => org.organization.id === selectedOrg);
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
    error: errorSwr,
    isLoading: isLoadingcategorizedLeads,
    mutate: mutateCategorizedLeads,
  } = useSWR(leadsKey ? leadsKey : null, handleFetchCategorizedLeadsData, {
    revalidateOnMount: true,
    dedupingInterval: 60000,
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (categorizedLeads) {
      console.log("categorizedLeads: ", categorizedLeads);
      setInitLeadsData(categorizedLeads);
    }
  }, [categorizedLeads]);

  const manageOrgUserKey =
    session?.user?.email && selectedOrg
      ? `fetch-org-user::${selectedOrg}`
      : null;

  const {
    data: manageOrgUserData,
    error: errorOrgUser,
    isLoading: isLoadingOrgUserData = true,
    mutate: mutateOrgUser,
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

  const sendRequest = async (url: string, { arg }: { arg: any }) => {
    console.log("url: ", url);
    console.log("arg: ", arg);
    const response = await axiosInstance.post(url, arg);
    if (response.data.error) throw new Error("error: ", response.data.error);
    console.log("deletedData: ", response.data);
    return "ok";
  };

  const {
    data: deletedData,
    trigger,
    isMutating,
  } = useSWRMutation("/leads/delete-categorized-lead", sendRequest);

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
                  Leads for {selectedOwner || "All Owners"}
                </h3>
                <Button color="primary" onPress={onAddOpen}>
                  Add New Owner
                </Button>
              </div>
            </div>

            {/* Table to display leads */}
            {isLoadingcategorizedLeads
              ? "loading"
              : categorizedLeads?.formatedcategorizedLeadsData && (
                  <Table aria-label="oraganization categorized leads">
                    <TableHeader columns={columns}>
                      {(column) => (
                        <TableColumn key={column.key} className="text-center">
                          {column.label}
                        </TableColumn>
                      )}
                    </TableHeader>

                    <TableBody
                      items={categorizedLeads?.formatedcategorizedLeadsData}
                    >
                      {(item: any) => (
                        <TableRow key={item.id}>
                          {columns.map((column) => (
                            <TableCell key={column.key} className="text-center">
                              {column.key === "actions" ? (
                                <div className="flex gap-2 justify-center">
                                  <Button
                                    size="sm"
                                    variant="light"
                                    onPress={() =>
                                      handleEditLead(item.id, item.owner)
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
                                        trigger({
                                          id: item.id,
                                          isAdmin:
                                            selectedOrgData.role === "ADMIN",
                                        })
                                      }
                                    >
                                      Delete
                                    </Button>
                                  )}
                                </div>
                              ) : (
                                getKeyValue(item, column.key)
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
                      value={form.leadName}
                      onChange={handleChange}
                    />
                    {/* <input
                      type="name"
                      id="name"
                      name="name"
                      className="w-full border border-gray-300 rounded-md p-3 focus:outline-none 
                      focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="you@example.com"
                      value={form.leadName}
                      onChange={handleChange}
                    /> */}
                  </div>
                  {error.nameError && (
                    <label className="flex items-center !mt-1 text-rose-600 text-xs">
                      <img
                        src={errorImageURL}
                        alt="error exclamatory"
                        className="max-w-[5%] mr-1"
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
                      {manageOrgUserData?.agentList?.map((agent: any) => (
                        <SelectItem key={agent.id}>{agent.name}</SelectItem>
                      ))}
                    </Select>

                    {/* <label
                      className="block text-gray-700 text-sm mb-2"
                      htmlFor="owner"
                    >
                      Owner
                    </label>
                    <input
                      type="owner"
                      id="owner"
                      name="owner"
                      className="w-full border border-gray-300 rounded-md p-3 
                      focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="••••••••"
                      value={form.owner}
                      onChange={handleChange}
                    />*/}
                  </div>
                  {/* {error.errorOwner && (
                    <label className="flex items-center !mt-1 text-rose-600 text-xs">
                      <img
                        src={errorImageURL}
                        alt="error exclamatory"
                        className="max-w-[5%] mr-1"
                      />
                      {error.errorOwner}
                    </label>
                  )} */}

                  <div>
                    {" "}
                    <Select
                      isDisabled={
                        selectedOrgData?.role !== "ADMIN" &&
                        selectedOrgData?.role === "MINER"
                      }
                      className="max-w-xs"
                      label="Assigned to"
                      name="assignedTo"
                      selectedKeys={[form.assignedTo]}
                      placeholder={
                        selectedOrgData?.role !== "ADMIN" &&
                        selectedOrgData?.role === "MINER"
                          ? `${session?.user?.name} (Me)`
                          : ""
                      }
                      onChange={handleChange}
                    >
                      {manageOrgUserData?.minerList?.map((miner: any) => (
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
