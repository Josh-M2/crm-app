"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { useSession } from "next-auth/react";
import SetUpOrg from "@/app/components/SetUpOrg";
import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/app/components/ProtectedPageSkeleton";
import { useOrganization } from "@/app/context/OrganizationContext";
import { inputChange } from "@/app/lib/inputChange";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import Image from "next/image";
import { FiArrowRight, FiTarget } from "react-icons/fi";
import {
  DealFormErrorTypes,
  DealFormTypes,
  DealsDataTypes,
  ModalPurpose,
  statusStrings,
  StatusTypes,
  Users,
} from "@/app/types/deals";
import { fetchOrgUserData, InitDealsData } from "@/app/lib/deals/api";
import { addDeal, deleteDeal, updateDeal } from "@/app/lib/deals/mutations";
import { getApiErrorMessage } from "@/app/lib/apiError";
import { columns, statusSelect } from "@/app/lib/deals/constants";

export default function DealsPage() {
  const { data: session, status } = useSession();
  const componentName = useMemo(() => "LeadsPage", []);
  const errorImageURL = useMemo(() => "/circle-exclamation-solid.svg", []);
  const { selectedOrg, isLoading } = useOrganization();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [purposefunc, setPurposeFunc] = useState<ModalPurpose>("");
  const [actionError, setActionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState<DealFormTypes>({
    name: "",
    amount: 0,
    status: "",
    owner: "",
  });

  const [error, setError] = useState<DealFormErrorTypes>({
    nameError: "",
    amountError: "",
    statusError: "",
    ownerError: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    console.log("value: ", e.target.value);
    console.log("target: ", e);
    inputChange({ e, setForm, setError, form, componentName });
  };

  const { trigger: triggerDeleteDeal } = useSWRMutation(
    "/deals/delete-deal",
    deleteDeal,
  );

  const { trigger: triggerAddDeal } = useSWRMutation(
    "/deals/add-deal",
    addDeal,
  );

  const { trigger: triggerUpdateDeal } = useSWRMutation(
    "/deals/update-deal",
    updateDeal,
  );

  const initDealsDataKey =
    session?.user?.email && selectedOrg
      ? `fetch-deals-data::${session.user.email}::${selectedOrg}`
      : null;

  const { data: initDealsData, error: dealsError, isLoading: isLoadingDealsData, mutate: refreshDeals } = useSWR(
    initDealsDataKey ? initDealsDataKey : null,
    InitDealsData,
    {
      revalidateOnMount: true,
      dedupingInterval: 60000,
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (initDealsData) console.log("initDealsData: ", initDealsData);
  }, [initDealsData]);

  const manageOrgUserKey =
    session?.user?.email && selectedOrg
      ? `fetch-org-user::${selectedOrg}`
      : null;

  const { data: manageOrgUserData } = useSWR(
    manageOrgUserKey ? manageOrgUserKey : null,
    fetchOrgUserData,
    {
      dedupingInterval: 60000,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      // onError: (err) => {
      //   console.error("Error fetching dashboard data:", err);
      // },
    },
  );

  const clearForm = () => {
    setForm({ name: "", amount: 0, status: "", owner: "" });
  };

  const handleOpenModal = useCallback(
    (purpose: ModalPurpose, userdata?: DealsDataTypes) => {
      setActionError("");
      console.log("userdata: ", userdata);
      setPurposeFunc(purpose as "add" | "edit");
      switch (purpose) {
        case "edit":
          console.log("handleOpenModal: ", userdata);
          setForm({
            name: userdata?.name !== undefined ? userdata.name : "unknown",
            amount:
              userdata?.amount !== undefined ? Number(userdata.amount) : 0,
            status:
              userdata?.status !== undefined
                ? (userdata.status as statusStrings)
                : "",
            owner:
              userdata?.ownerId !== undefined ? userdata.ownerId : "unknown",
            id: userdata?.id !== undefined ? userdata.id : "unknown",
          });
          break;
        case "add":
          clearForm();
          break;
        default:
          break;
      }

      onOpen();
    },
    [setForm, onOpen],
  );

  const handleSubmitFrom = async (
    onClose: () => void,
    orgID: string,
    data: DealsDataTypes | DealFormTypes,
  ) => {
    setActionError("");
    const amount = Number(data.amount);
    if (!data.name.trim() || !Number.isFinite(amount) || amount <= 0 || !data.owner || !data.status) {
      setActionError("Enter a deal name, positive amount, owner, and status.");
      return;
    }

    setIsSubmitting(true);
    try {
      switch (purposefunc) {
        case "edit":
          await triggerUpdateDeal({
            dealId: data.id as string,
            selectedOrg: orgID,
            name: data.name,
            amount,
            status: data.status as statusStrings,
            ownerId: data.owner,
          });
          break;
        case "add":
          await triggerAddDeal({
            selectedOrg: orgID,
            name: data.name,
            amount,
            status: data.status as statusStrings,
            userid: data.owner,
          });
          break;
        default:
          return;
      }
      await refreshDeals();
      clearForm();
      onClose();
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Unable to save the deal."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDeal = async (id: string) => {
    setActionError("");
    setDeletingId(id);
    try {
      await triggerDeleteDeal({ id, selectedOrg: selectedOrg as string });
      await refreshDeals();
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Unable to delete the deal."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {status === "loading" || isLoading ? (
        <div className="">
          <PageHeaderSkeleton hasAction />
          <TableSkeleton columns={5} />
        </div>
      ) : selectedOrg ? (
        <>
          <div className="">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="workspace-kicker mb-2">Pipeline / Deals</p>
                <h1 className="workspace-heading">Deals</h1>
                <p className="workspace-subtitle mt-2">Track opportunities and keep every deal moving forward.</p>
              </div>
              <Button color="primary" className="min-h-11 rounded-xl px-5 font-semibold" onPress={() => handleOpenModal("add")}>
                Add deal
              </Button>
            </div>
            {actionError && !isOpen && (
              <p role="alert" className="mb-4 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {actionError}
              </p>
            )}
          </div>

          {isLoadingDealsData ? (
            <TableSkeleton className="" columns={5} />
          ) : dealsError ? (
            <p role="alert" className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              Unable to load deals. Please try again.
            </p>
          ) : (
            initDealsData && (initDealsData.formatedDealsData.length ? (
              <div className="overflow-x-auto rounded-2xl">
              <Table aria-label="Deals" className="min-w-[680px]">
                <TableHeader columns={columns}>
                  {(column) => (
                    <TableColumn key={column.key} className="text-center">
                      {column.label}
                    </TableColumn>
                  )}
                </TableHeader>
                <TableBody items={initDealsData.formatedDealsData}>
                  {(item) => (
                    <TableRow key={item.id}>
                      {columns.map((column: StatusTypes) => (
                        <TableCell key={column.key} className="text-center">
                          {column.key === "actions" ? (
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="light"
                                onPress={() =>
                                  handleOpenModal("edit", {
                                    ...item,
                                    status: item.status as
                                      | "pending"
                                      | "won"
                                      | "lost",
                                  })
                                }
                              >
                                Edit
                              </Button>
                              {initDealsData.userRole === "ADMIN" && (
                                <Button
                                  size="sm"
                                  variant="light"
                                  color="danger"
                                  isLoading={deletingId === item.id}
                                  onPress={() => handleDeleteDeal(item.id)}
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          ) : column.key === "amount" ? (
                            new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(item.amount))
                          ) : column.key === "status" ? (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                item.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : item.status === "won"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.status}
                            </span>
                          ) : (
                            getKeyValue(item, column.key)
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            ) : (
              <div className="workspace-panel flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><FiTarget size={26} aria-hidden="true" /></div>
                <h2 className="mt-5 text-xl font-bold text-slate-900">Create your first deal</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Add an opportunity, set its value and owner, and track it through your pipeline.</p>
                <Button color="primary" endContent={<FiArrowRight aria-hidden="true" />} className="mt-6 rounded-xl px-5 font-semibold" onPress={() => handleOpenModal("add")}>Add a deal</Button>
              </div>
            ))
          )}
        </>
      ) : (
        <SetUpOrg />
      )}
      {/* Add Deal Modal */} {/* Edit Deal Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {purposefunc === "edit" ? "Edit Deal" : "Add New Deal"}
              </ModalHeader>
              <ModalBody>
                {actionError && (
                  <p role="alert" className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {actionError}
                  </p>
                )}
                <form
                  className="space-y-6"
                  onSubmit={async (e) => {
                    e.preventDefault();

                    handleSubmitFrom(onClose, selectedOrg as string, form);
                  }}
                >
                  <div>
                    <Input
                      isRequired
                      label="Deal name"
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
                      label="Amount $"
                      type="number"
                      min={0.01}
                      step={0.01}
                      id="amount"
                      name="amount"
                      color={error.amountError ? "danger" : "default"}
                      value={form.amount.toString()}
                      onChange={handleChange}
                    />
                  </div>
                  {error.amountError && (
                    <label className="flex items-center !mt-1 text-rose-600 text-xs">
                      <Image
                        src={errorImageURL}
                        alt="error exclamatory"
                        width={12}
                        height={12}
                        className="mr-1"
                      />
                      {error.amountError}
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
                      {(manageOrgUserData?.agentList ?? []).map(
                        (agent: Users) => (
                          <SelectItem key={agent.id}>{agent.name}</SelectItem>
                        ),
                      )}
                    </Select>
                  </div>

                  <div>
                    <Select
                      isRequired
                      className="max-w-xs"
                      label="Select status"
                      name="status"
                      selectedKeys={[form.status.toLowerCase()]}
                      onChange={handleChange}
                    >
                      {statusSelect?.map((status: StatusTypes) => (
                        <SelectItem key={status.key}>{status.label}</SelectItem>
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
                      isLoading={isSubmitting}
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
    </>
  );
}
