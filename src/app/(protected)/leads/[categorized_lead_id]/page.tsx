"use client";

import React, { use, useEffect, useMemo, useState } from "react";
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
import { TableSkeleton } from "@/app/components/ProtectedPageSkeleton";
import SetUpOrg from "@/app/components/SetUpOrg";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useOrganization } from "@/app/context/OrganizationContext";
import axiosInstance from "@/app/lib/axiosInstance";
import { getApiErrorMessage } from "@/app/lib/apiError";
import { inputChange } from "@/app/lib/inputChange";
import useSWRMutation from "swr/mutation";
import Image from "next/image";
import type {
  Lead as PrismaLead,
  LeadStatus,
  OrganizationUserRole,
} from "@prisma/client";

type LeadRow = {
  id: string;
  name: string;
  company: string;
  email: string;
  status: LeadStatus;
  lastInteraction: string;
};

type LeadForm = {
  id: string;
  name: string;
  company: string;
  email: string;
  status: LeadStatus;
};

type LeadFormError = {
  nameError: string;
  companyError: string;
  emailError: string;
  statusError: string;
};

type LeadMutationArg = {
  organizationId: string | null;
  categoryId?: string;
  leadId?: string;
  name: string;
  company: string;
  leadEmail: string;
  status: LeadStatus;
};

type DeleteLeadArg = {
  id: string;
  selectedOrg: string | null;
};

type LeadListApiResponse = {
  leadList: PrismaLead[];
  categoryName: string;
  userRole: { role: OrganizationUserRole };
  error?: string;
};

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
    label: "EMAIL",
  },
  {
    key: "status",
    label: "STATUS",
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

const leadStatus = [
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

const handleFormatLeadList = (apiData: PrismaLead[]): LeadRow[] => {
  return apiData.map((lead) => ({
    id: lead.id,
    name: lead.name,
    company: lead.company,
    email: lead.email,
    status: lead.status,
    lastInteraction:
      lead.lastInteraction instanceof Date
        ? lead.lastInteraction.toISOString().split("T")[0]
        : String(lead.lastInteraction).split("T")[0],
  }));
};

const handleFecthLeadsList = async (refData: string) => {
  console.log("handleFetchCategorizedLeadsDataRefdata", refData);
  if (!refData) return null;

  const [, email, selectedOrg, categorized_lead_id] = refData.split("::");

  const response = await axiosInstance.get<LeadListApiResponse>(
    "/leads/manage-lead-list/fetch-lead-list",
    {
      params: {
        email: email,
        catId: categorized_lead_id,
        selectedOrg: selectedOrg,
      },
    },
  );
  if (response.data.error) throw new Error(`error: ${response.data.error}`);

  console.log("handleFecthLeadsListData: ", response.data.leadList);
  const formatedLeads = handleFormatLeadList(response.data.leadList);

  console.log("formatedLeads: ", formatedLeads);
  return {
    formatedLeads: formatedLeads,
    categoryName: response.data.categoryName,
    userRole: response.data.userRole.role,
  };
};

const sendRequestToCreateLead = async (
  url: string,
  { arg }: { arg: LeadMutationArg },
) => {
  console.log("url: ", url);
  console.log("arg: ", arg);
  const response = await axiosInstance.post(url, arg);
  if (response.data.error) throw new Error(`error: ${response.data.error}`);
  console.log("addeddate: ", response.data);
  return "ok";
};

const sendRequestToUpdateLead = async (
  url: string,
  { arg }: { arg: LeadMutationArg },
) => {
  console.log("url: ", url);
  console.log("arg: ", arg);
  const response = await axiosInstance.post(url, arg);
  if (response.data.error) throw new Error(`error: ${response.data.error}`);
  console.log("deletedData: ", response.data);
  return "ok";
};

const sendRequestToDeleteCategorizedLead = async (
  url: string,
  { arg }: { arg: DeleteLeadArg },
) => {
  console.log("url: ", url);
  console.log("arg: ", arg);
  const response = await axiosInstance.post(url, arg);
  if (response.data.error) throw new Error(`error: ${response.data.error}`);
  console.log("deletedData: ", response.data);
  return "ok";
};

export default function EditLeadsPage({
  params,
  searchParams,
}: ProductPageProps) {
  const errorImageURL = useMemo(() => "/circle-exclamation-solid.svg", []);
  const { data: session, status } = useSession();
  const { selectedOrg, isLoading } = useOrganization();

  const query = use(searchParams);
  const { categorized_lead_id } = use(params);
  const leadName = query.leadName;
  const queryLeadTitle = typeof leadName === "string" ? leadName : "";

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

  const [form, setForm] = useState<LeadForm>({
    id: "",
    name: "",
    company: "",
    email: "",
    status: "NEW",
  });

  const [error, setError] = useState<LeadFormError>({
    nameError: "",
    companyError: "",
    emailError: "",
    statusError: "",
  });
  const [actionError, setActionError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    console.log("value: ", e.target.value);
    console.log("target: ", e);
    inputChange({ e, setForm, setError, form });
  };

  const listOfLeadsKey =
    session?.user?.email && selectedOrg
      ? `fetch-leads-list::${session.user.email}::${selectedOrg}::${categorized_lead_id}`
      : null;

  const { data: listOfLeads, isLoading: isLoadingListOfLeads, error: leadListError, mutate: refreshLeadList } = useSWR(
    listOfLeadsKey ? listOfLeadsKey : null,
    handleFecthLeadsList,
    {
      revalidateOnMount: true,
      dedupingInterval: 60000,
      revalidateIfStale: false,
    },
  );

  const leadTitle = listOfLeads?.categoryName ?? queryLeadTitle;

  useEffect(() => {
    if (listOfLeads) console.log("listOfLeads: ", listOfLeads);
  }, [listOfLeads]);

  const handleEditLead = (form: LeadRow) => {
    // Navigate to the edit page for this lead ID
    console.log("form: ", form);
    setForm(form);
    setActionError("");
    onEditOpen();
  };

  const handleDeleteLead = async (id: string) => {
    setActionError("");
    setDeletingId(id);
    try {
      await triggerDeleteLead({ id, selectedOrg });
      await refreshLeadList();
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Unable to delete the lead."));
    } finally {
      setDeletingId(null);
    }
  };

  const { trigger: triggerCreateNewLead } = useSWRMutation(
    "/leads/manage-lead-list/add-lead-item",
    sendRequestToCreateLead,
  );

  const handleCreateNewLead = async (form: LeadForm, onClose: () => void) => {
    setActionError("");
    setIsAdding(true);
    try {
      await triggerCreateNewLead({
        organizationId: selectedOrg,
        categoryId: categorized_lead_id,
        name: form.name,
        company: form.company,
        leadEmail: form.email,
        status: form.status,
      });
      await refreshLeadList();
      setForm({ id: "", name: "", company: "", email: "", status: "NEW" });
      onClose();
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Unable to add the lead."));
    } finally {
      setIsAdding(false);
    }
  };

  const { trigger: triggerUpdateLeadData } = useSWRMutation(
    "/leads/manage-lead-list/update-lead-item",
    sendRequestToUpdateLead,
  );

  const handleUpdateLead = async (form: LeadForm, onClose: () => void) => {
    setActionError("");
    setIsUpdating(true);
    try {
      await triggerUpdateLeadData({
        organizationId: selectedOrg,
        categoryId: categorized_lead_id,
        leadId: form.id,
        name: form.name,
        company: form.company,
        leadEmail: form.email,
        status: form.status,
      });
      await refreshLeadList();
      setForm({ id: "", name: "", company: "", email: "", status: "NEW" });
      onClose();
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Unable to update the lead."));
    } finally {
      setIsUpdating(false);
    }
  };

  const { trigger: triggerDeleteLead } = useSWRMutation(
    "/leads/manage-lead-list/delete-lead",
    sendRequestToDeleteCategorizedLead,
  );

  if (status === "loading" || isLoading || (selectedOrg && isLoadingListOfLeads)) {
    return <TableSkeleton columns={6} />;
  }

  if (!selectedOrg) return <SetUpOrg />;

  if (!categorized_lead_id || leadListError) {
    return <div role="alert">{leadListError ? getApiErrorMessage(leadListError, "Unable to load this lead list.") : "No lead list found."}</div>;
  }

  return (
    <>
      {/* Header */}

      <div className="flex justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold mb-4 ">Leads for {leadTitle}</h2>
          <p className="text-lg mb-8 ">
            Manage and edit the leads of {leadTitle}.
          </p>
        </div>
        <div className="flex items-end">
          <Button color="primary" onPress={() => { setActionError(""); onAddOpen(); }}>
            Add New Lead
          </Button>
        </div>
      </div>
      {actionError && !isAddOpen && !isEditOpen && (
        <p role="alert" className="mb-4 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {actionError}
        </p>
      )}

      {/* Leads Table */}
      {isLoading || isLoadingListOfLeads ? (
        <TableSkeleton className="" columns={6} />
      ) : listOfLeads?.formatedLeads.length ? (
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
                  <TableCell key={column.key} className="text-center">
                    {column.key === "name" ? (
                      lead.name
                    ) : column.key === "company" ? (
                      lead.company
                    ) : column.key === "email" ? (
                      lead.email
                    ) : column.key === "status" ? (
                      <span
                        className={`px-3 py-1 rounded-full ${
                          lead.status === "NEW"
                            ? "bg-blue-100 text-blue-700"
                            : lead.status === "IN_PROGRESS"
                              ? "bg-yellow-100 text-yellow-700"
                              : lead.status === "CONVERTED"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {lead.status === "IN_PROGRESS"
                          ? "In Progress"
                          : capitalizeStatus(lead.status)}
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
                            isLoading={deletingId === lead.id}
                            onPress={() => handleDeleteLead(lead.id)}
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
        <div className=" rounded-lg border border-gray-200 bg-white p-6 text-gray-600">
          No leads found.
        </div>
      )}

      <Modal isOpen={isAddOpen} onOpenChange={onAddOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add Lead</ModalHeader>
              <ModalBody>
                {actionError && (
                  <p role="alert" className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {actionError}
                  </p>
                )}
                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateNewLead(form, onClose);
                  }}
                >
                  <div>
                    <Input
                      isRequired
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
                    <Input
                      isRequired
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
                      <Image
                        src={errorImageURL}
                        alt="error exclamatory"
                        width={12}
                        height={12}
                        className="mr-1"
                      />
                      {error.companyError}
                    </label>
                  )}

                  <div>
                    <Input
                      isRequired
                      label="Email"
                      type="email"
                      id="email"
                      name="email"
                      color={error.emailError ? "danger" : "default"}
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                  {error.emailError && (
                    <label className="flex items-center !mt-1 text-rose-600 text-xs">
                      <Image
                        src={errorImageURL}
                        alt="error exclamatory"
                        width={12}
                        height={12}
                        className="mr-1"
                      />
                      {error.emailError}
                    </label>
                  )}

                  <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button color="primary" type="submit" isLoading={isAdding}>
                      Add Lead
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
              <ModalHeader>Update Lead</ModalHeader>
              <ModalBody>
                {actionError && (
                  <p role="alert" className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {actionError}
                  </p>
                )}
                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateLead(form, onClose);
                  }}
                >
                  <div>
                    <Input
                      isRequired
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
                    <Input
                      isRequired
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
                      <Image
                        src={errorImageURL}
                        alt="error exclamatory"
                        width={12}
                        height={12}
                        className="mr-1"
                      />
                      {error.companyError}
                    </label>
                  )}

                  <div>
                    <Input
                      isRequired
                      label="Email"
                      type="email"
                      id="email"
                      name="email"
                      color={error.emailError ? "danger" : "default"}
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                  {error.emailError && (
                    <label className="flex items-center !mt-1 text-rose-600 text-xs">
                      <Image
                        src={errorImageURL}
                        alt="error exclamatory"
                        width={12}
                        height={12}
                        className="mr-1"
                      />
                      {error.emailError}
                    </label>
                  )}

                  <div>
                    <Select
                      isRequired
                      className="max-w-xs"
                      label="Status"
                      name="status"
                      selectedKeys={[form.status.toLowerCase()]}
                      onChange={handleChange}
                    >
                      {leadStatus.map((status) => (
                        <SelectItem key={status.key}>{status.label}</SelectItem>
                      ))}
                    </Select>
                  </div>

                  <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button color="primary" type="submit" isLoading={isUpdating}>
                      Update Lead
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
