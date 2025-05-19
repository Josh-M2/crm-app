"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation"; // Using useSearchParams
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
import { motion } from "framer-motion";
import Sidebar from "@/app/components/Sidebar";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useOrganization } from "@/app/context/OrganizationContext";
import axiosInstance from "@/lib/axiosInstance";
import { inputChange } from "@/lib/inputChange";
import useSWRMutation from "swr/mutation";

type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  status: "New" | "In Progress" | "Converted" | "Contacted";
  lastInteraction: string;
};

const dummyLeads: Lead[] = [
  {
    id: "1",
    name: "John Doe",
    company: "Tech Corp",
    email: "john.doe@example.com",
    status: "New",
    lastInteraction: "2025-04-25",
  },
  {
    id: "2",
    name: "Jane Smith",
    company: "Innovate LLC",
    email: "jane.smith@example.com",
    status: "In Progress",
    lastInteraction: "2025-04-23",
  },
  {
    id: "3",
    name: "Alice Johnson",
    company: "Growth Inc.",
    email: "alice.johnson@example.com",
    status: "Converted",
    lastInteraction: "2025-04-20",
  },
  {
    id: "4",
    name: "Alice Johnson",
    company: "Growth Inc.",
    email: "alice.johnson@example.com",
    status: "Contacted",
    lastInteraction: "2025-04-20",
  },
];

const columns = [
  {
    key: "name",
    label: "NAME",
  },
  {
    key: "company",
    label: "COMPANY",
  },
  {
    key: "email",
    label: "email",
  },
  {
    key: "status",
    label: "Status",
  },
  {
    key: "lastInteraction",
    label: "LAST INTERACTION",
  },
  {
    key: "actions",
    label: "ACTIONS",
  },
];

export const leadStatus = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "in_progress", label: "In Progress" },
  { key: "converted", label: "Converted" },
];

interface ProductPageProps {
  params: Promise<{ categorized_lead_id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const capitalizeStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const handleFormatLeadList = (apiData: any[]) => {
  return apiData.map((lead) => ({
    id: lead.id,
    name: lead.name,
    company: lead.company,
    email: lead.email,
    status: capitalizeStatus(lead.status),
    lastInteraction: lead.lastInteraction.split("T")[0],
  }));
};

const handleFecthLeadsList = async (refData: string) => {
  console.log("handleFetchCategorizedLeadsDataRefdata", refData);
  if (!refData) return;

  const [_, email, selectedOrg, categorized_lead_id] = refData.split("::");

  const response = await axiosInstance.get(
    "/leads/manage-lead-list/fetch-lead-list",
    {
      params: {
        email: email,
        catId: categorized_lead_id,
        selectedOrg: selectedOrg,
      },
    }
  );
  if (response.data.error) throw new Error("error: ", response.data.error);

  console.log("handleFecthLeadsListData: ", response.data.leadList);
  const formatedLeads = handleFormatLeadList(response.data.leadList);

  console.log("formatedLeads: ", formatedLeads);
  return {
    formatedLeads: formatedLeads,
    userRole: response.data.userRole.role,
  };
};

const sendRequestToCreateLead = async (url: string, { arg }: { arg: any }) => {
  console.log("url: ", url);
  console.log("arg: ", arg);
  const response = await axiosInstance.post(url, arg);
  if (response.data.error) throw new Error("error: ", response.data.error);
  console.log("addeddate: ", response.data);
  return "ok";
};

const sendRequestToUpdateLead = async (url: string, { arg }: { arg: any }) => {
  console.log("url: ", url);
  console.log("arg: ", arg);
  const response = await axiosInstance.post(url, arg);
  if (response.data.error) throw new Error("error: ", response.data.error);
  console.log("addeddate: ", response.data);
  return "ok";
};

const sendRequestToDeleteCategorizedLead = async (
  url: string,
  { arg }: { arg: any }
) => {
  console.log("url: ", url);
  console.log("arg: ", arg);
  const response = await axiosInstance.post(url, arg);
  if (response.data.error) throw new Error("error: ", response.data.error);
  console.log("deletedData: ", response.data);
  return "ok";
};

export default function EditLeadsPage({
  params,
  searchParams,
}: ProductPageProps) {
  const errorImageURL = useMemo(() => "/circle-exclamation-solid.svg", []);
  const { data: session, status } = useSession();
  const { selectedOrg } = useOrganization();

  const [leads, setLeads] = useState<Lead[]>(dummyLeads);

  const query = use(searchParams);
  const { categorized_lead_id } = use(params);
  const leadName = query.leadName;

  const [isOpenSideBar, setIsOpenSideBar] = useState<boolean>(true);
  const toggleSidebar = () => setIsOpenSideBar((prev) => !prev);
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onOpenChange: onAddOpenChange,
  } = useDisclosure();

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onOpenChange: onEditOpenChange,
  } = useDisclosure();

  const [form, setForm] = useState<any>({
    id: "",
    name: "",
    company: "",
    email: "",
    status: "NEW",
  });

  const [error, setError] = useState<any>({
    nameError: "",
    companyError: "",
    emailError: "",
    statusError: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    console.log("value: ", e.target.value);
    console.log("target: ", e);
    inputChange({ e, setForm, setError, form });
  };

  if (!categorized_lead_id || !leadName) {
    return <div>Error: No owner found in the query parameters.</div>;
  }

  const listOfLeadsKey =
    session?.user?.email && selectedOrg
      ? `fetch-leads-list::${session.user.email}::${selectedOrg}::${categorized_lead_id}`
      : null;

  const {
    data: listOfLeads,
    error: errorListOfLeads,
    isLoading: isLoadingListOfLeads,
    mutate: mutateListOfLeads,
  } = useSWR(listOfLeadsKey ? listOfLeadsKey : null, handleFecthLeadsList, {
    revalidateOnMount: true,
    dedupingInterval: 60000,
    revalidateIfStale: false,
  });

  useEffect(() => {
    if (listOfLeads) console.log("listOfLeads: ", listOfLeads);
  }, [listOfLeads]);

  // Filter the leads based on the owner query param
  const leadsForOwner = leads;

  const handleEditLead = (form: any) => {
    // Navigate to the edit page for this lead ID
    console.log("form: ", form);
    setForm(form);
    onEditOpen();
  };

  const handleDeleteLead = (id: string, isAdmin: boolean) => {
    triggerDeleteLead({
      id,
      isAdmin,
    });
  };

  const {
    data: creatednewLead,
    trigger: triggerCreateNewLead,
    isMutating: ismutatingCreateNewLead,
  } = useSWRMutation(
    "/leads/manage-lead-list/add-lead-item",
    sendRequestToCreateLead
  );

  const handleCreateNewLead = async (form: any) => {
    await triggerCreateNewLead({
      organizationId: selectedOrg, //organization ID
      email: session?.user?.email,
      categoryId: categorized_lead_id,

      name: form.name,
      company: form.company,
      leadEmail: form.email,
      status: form.status,
    });

    setForm({ name: "", company: "", email: "", status: "NEW" });
  };

  const {
    data: updateLeadData,
    trigger: triggerUpdateLeadData,
    isMutating: isMutatingUpdateLeadData,
  } = useSWRMutation(
    "/leads/manage-lead-list/update-lead-item",
    sendRequestToUpdateLead
  );

  const handleUpdateLead = async (form: any, onClose: () => void) => {
    await triggerUpdateLeadData({
      organizationId: selectedOrg, //organization ID
      email: session?.user?.email,
      categoryId: categorized_lead_id,

      leadId: form.id,
      name: form.name,
      company: form.company,
      leadEmail: form.email,
      status: form.status,
    });
    setForm({ id: "", name: "", company: "", email: "", status: "NEW" });
    onClose();
  };

  const {
    data: deletedLead,
    trigger: triggerDeleteLead,
    isMutating: isMutatingDeleteLead,
  } = useSWRMutation(
    "/leads/manage-lead-list/delete-lead",
    sendRequestToDeleteCategorizedLead
  );

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
        className="flex flex-col w-full p-8  mx-auto p-6"
        animate={{ marginLeft: isOpenSideBar ? "16rem" : "0" }} // smooth transition of margin-left (lg:ml-64)
        transition={{ duration: 0.2 }} // Set transition duration for smooth effect
      >
        {/* Header */}

        <div className="flex justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-4 ml-10">
              Leads for {leadName}
            </h2>
            <p className="text-lg mb-8 ml-10">
              Manage and edit the leads of {leadName}.
            </p>
          </div>
          <div className="flex items-end">
            <Button color="primary" onPress={onAddOpen}>
              Add New Lead
            </Button>
          </div>
        </div>

        {/* Leads Table */}
        {isLoadingListOfLeads ? (
          "loading"
        ) : listOfLeads ? (
          <Table aria-label="categorize's lead list">
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key} className="text-center">
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>

            <TableBody items={listOfLeads.formatedLeads}>
              {(lead) => (
                <TableRow key={lead.id}>
                  {columns.map((column) => (
                    <TableCell className="text-center">
                      {column.key === "name" ? (
                        lead.name
                      ) : column.key === "company" ? (
                        lead.company
                      ) : column.key === "email" ? (
                        lead.email
                      ) : column.key === "status" ? (
                        <span
                          className={`px-3 py-1 rounded-full ${
                            lead.status === "New"
                              ? "bg-blue-100 text-blue-700"
                              : lead.status === "In_progress"
                              ? "bg-yellow-100 text-yellow-700"
                              : lead.status === "Converted"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {lead.status === "In_progress"
                            ? "In Progress"
                            : lead.status}
                        </span>
                      ) : column.key === "lastInteraction" ? (
                        lead.lastInteraction
                      ) : column.key === "actions" ? (
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="light"
                            size="sm"
                            onPress={() => handleEditLead(lead)}
                          >
                            Edit
                          </Button>
                          {listOfLeads.userRole === "ADMIN" && (
                            <Button
                              variant="light"
                              size="sm"
                              color="danger"
                              onPress={() =>
                                handleDeleteLead(
                                  lead.id,
                                  listOfLeads.userRole === "ADMIN"
                                )
                              }
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      ) : null}
                    </TableCell>
                  ))}
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          "no leads found"
        )}
      </motion.main>
      {/* The sidebar toggle button */}
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
              <ModalHeader>Add New Deal</ModalHeader>
              <ModalBody>
                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateNewLead(form);
                  }}
                >
                  <div>
                    <Input
                      // isRequired
                      label="Name"
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
                      <img
                        src={errorImageURL}
                        alt="error exclamatory"
                        className="max-w-[5%] mr-1"
                      />
                      {error.nameError}
                    </label>
                  )}
                  <div>
                    <Input
                      // isRequired
                      label="Company"
                      type="text"
                      id="company"
                      name="company"
                      color={error.companyError ? "danger" : "default"}
                      value={form.company}
                      onChange={handleChange}
                    />
                  </div>

                  {error.companyError && (
                    <label className="flex items-center !mt-1 text-rose-600 text-xs">
                      <img
                        src={errorImageURL}
                        alt="error exclamatory"
                        className="max-w-[5%] mr-1"
                      />
                      {error.companyError}
                    </label>
                  )}

                  <div>
                    <Input
                      // isRequired
                      label="Email"
                      type="text"
                      id="email"
                      name="email"
                      color={error.emailError ? "danger" : "default"}
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                  {error.emailError && (
                    <label className="flex items-center !mt-1 text-rose-600 text-xs">
                      <img
                        src={errorImageURL}
                        alt="error exclamatory"
                        className="max-w-[5%] mr-1"
                      />
                      {error.emailError}
                    </label>
                  )}

                  <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button color="primary" type="submit">
                      Add Deal
                    </Button>
                  </ModalFooter>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Update Deal</ModalHeader>
              <ModalBody>
                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateLead(form, onClose);
                  }}
                >
                  <div>
                    <Input
                      // isRequired
                      label="Name"
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
                      <img
                        src={errorImageURL}
                        alt="error exclamatory"
                        className="max-w-[5%] mr-1"
                      />
                      {error.nameError}
                    </label>
                  )}
                  <div>
                    <Input
                      // isRequired
                      label="Company"
                      type="text"
                      id="company"
                      name="company"
                      color={error.companyError ? "danger" : "default"}
                      value={form.company}
                      onChange={handleChange}
                    />
                  </div>

                  {error.companyError && (
                    <label className="flex items-center !mt-1 text-rose-600 text-xs">
                      <img
                        src={errorImageURL}
                        alt="error exclamatory"
                        className="max-w-[5%] mr-1"
                      />
                      {error.companyError}
                    </label>
                  )}

                  <div>
                    <Input
                      // isRequired
                      label="Email"
                      type="text"
                      id="email"
                      name="email"
                      color={error.emailError ? "danger" : "default"}
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                  {error.emailError && (
                    <label className="flex items-center !mt-1 text-rose-600 text-xs">
                      <img
                        src={errorImageURL}
                        alt="error exclamatory"
                        className="max-w-[5%] mr-1"
                      />
                      {error.emailError}
                    </label>
                  )}

                  <div>
                    <Select
                      // isRequired
                      className="max-w-xs"
                      label="Status"
                      name="status"
                      selectedKeys={[form.status.toLowerCase()]}
                      onChange={handleChange}
                    >
                      {leadStatus.map((status: any) => (
                        <SelectItem key={status.key}>{status.label}</SelectItem>
                      ))}
                    </Select>
                  </div>

                  <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button color="primary" type="submit">
                      Update Deal
                    </Button>
                  </ModalFooter>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
