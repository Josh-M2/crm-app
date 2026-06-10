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
import { motion } from "framer-motion";
import Sidebar from "@/app/components/Sidebar";
import { useSession } from "next-auth/react";
import SetUpOrg from "@/app/components/SetUpOrg";
import { useOrganization } from "@/app/context/OrganizationContext";
import { inputChange } from "@/app/lib/inputChange";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
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
import { columns, statusSelect } from "@/app/lib/deals/constants";

export default function DealsPage() {
  const { data: session, status } = useSession();
  const componentName = useMemo(() => "LeadsPage", []);
  const errorImageURL = useMemo(() => "/circle-exclamation-solid.svg", []);
  const { selectedOrg, organizations } = useOrganization();
  const [isOpenSideBar, setIsOpenSideBar] = useState<boolean>(true);
  const toggleSidebar = () => setIsOpenSideBar((prev) => !prev);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [purposefunc, setPurposeFunc] = useState<ModalPurpose>("");

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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    console.log("value: ", e.target.value);
    console.log("target: ", e);
    inputChange({ e, setForm, setError, form, componentName });
  };

  const {
    data: deletedDeal,
    trigger: triggerDeleteDeal,
    isMutating: ismutatingDeleteDeal,
  } = useSWRMutation("/deals/delete-deal", deleteDeal);

  const {
    data: insertedDeal,
    trigger: triggerAddDeal,
    isMutating: ismutatingDeal,
  } = useSWRMutation("/deals/add-deal", addDeal);

  const {
    data: updatedDeal,
    trigger: triggerUpdateDeal,
    isMutating: isMutatingUpdateDeal,
  } = useSWRMutation("/deals/update-deal", updateDeal);

  const initDealsDataKey =
    session?.user?.email && selectedOrg
      ? `fetch-deals-data::${session.user.email}::${selectedOrg}`
      : null;

  const {
    data: initDealsData,
    error: errorinitDealsData,
    isLoading: isLoadingDealsData,
    mutate,
  } = useSWR(initDealsDataKey ? initDealsDataKey : null, InitDealsData, {
    revalidateOnMount: true,
    dedupingInterval: 60000,
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (initDealsData) console.log("initDealsData: ", initDealsData);
  }, [initDealsData]);

  const manageOrgUserKey =
    session?.user?.email && selectedOrg
      ? `fetch-org-user::${selectedOrg}`
      : null;

  const {
    data: manageOrgUserData,
    error: errorOrgUser,
    isLoading: isLoadingOrgUserData = true,
    mutate: mutateOrgUser,
  } = useSWR(manageOrgUserKey ? manageOrgUserKey : null, fetchOrgUserData, {
    dedupingInterval: 60000,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    // onError: (err) => {
    //   console.error("Error fetching dashboard data:", err);
    // },
  });

  const clearForm = () => {
    setForm({ name: "", amount: 0, status: "", owner: "" });
  };

  const handleOpenModal = useCallback(
    (purpose: ModalPurpose, userdata?: DealsDataTypes) => {
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
    [setForm, onOpen]
  );

  const handleSubmitFrom = async (
    onClose: () => void,
    orgID: string,
    data: DealsDataTypes | DealFormTypes
  ) => {
    console.log("handleSubmitFrom: ", data);
    switch (purposefunc) {
      case "edit":
        await triggerUpdateDeal({
          dealId: data.id as string,
          name: data.name,
          amount: data.amount,
          status: data.status as statusStrings,
          ownerId: data.owner,
        });
        clearForm();
        break;
      case "add":
        await triggerAddDeal({
          selectedOrg: orgID,
          name: data.name,
          amount: data.amount,
          status: data.status as statusStrings,
          userid: data.owner,
        });

        clearForm();
        break;

      default:
        break;
    }

    onClose();
  };

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
        className="flex flex-col w-full p-8"
        animate={{ marginLeft: isOpenSideBar ? "16rem" : "0" }} // smooth transition of margin-left (lg:ml-64)
        transition={{ duration: 0.2 }} // Set transition duration for smooth effect
      >
        {selectedOrg ? (
          <>
            <div className="ml-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Deals</h2>
                <Button color="primary" onPress={() => handleOpenModal("add")}>
                  Add New Deal
                </Button>
              </div>
            </div>

            {isLoadingDealsData
              ? "loading"
              : initDealsData && (
                  <Table aria-label="Deals Table">
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
                                      onPress={() =>
                                        triggerDeleteDeal({
                                          id: item.id,
                                          isAdmin:
                                            initDealsData?.userRole === "ADMIN",
                                        })
                                      }
                                    >
                                      Delete
                                    </Button>
                                  )}
                                </div>
                              ) : column.key === "amount" ? (
                                `$${item.amount}`
                              ) : column.label === "status" ? (
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
      {/* Add Deal Modal */} {/* Edit Deal Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {purposefunc === "edit" ? "Edit Deal" : "Add New Deal"}
              </ModalHeader>
              <ModalBody>
                <form
                  className="space-y-6"
                  onSubmit={async (e) => {
                    e.preventDefault();

                    handleSubmitFrom(onClose, selectedOrg as string, form);
                  }}
                >
                  <div>
                    <Input
                      // isRequired
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
                      label="Amount $"
                      type="number"
                      id="amount"
                      name="amount"
                      color={error.amountError ? "danger" : "default"}
                      value={form.amount.toString()}
                      onChange={handleChange}
                    />
                  </div>
                  {error.amountError && (
                    <label className="flex items-center !mt-1 text-rose-600 text-xs">
                      <img
                        src={errorImageURL}
                        alt="error exclamatory"
                        className="max-w-[5%] mr-1"
                      />
                      {error.amountError}
                    </label>
                  )}

                  <div>
                    <Select
                      isRequired
                      className="max-w-xs"
                      label="Select an Agent"
                      name="owner"
                      selectedKeys={[form.owner]}
                      onChange={handleChange}
                    >
                      {(manageOrgUserData?.agentList ?? []).map(
                        (agent: Users) => (
                          <SelectItem key={agent.id}>{agent.name}</SelectItem>
                        )
                      )}
                    </Select>
                  </div>

                  <div>
                    <Select
                      // isRequired
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
