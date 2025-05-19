"use client";

import React, { useMemo, useState } from "react";
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
  form,
} from "@heroui/react";
import { motion } from "framer-motion";
import Sidebar from "@/app/components/Sidebar";
import { useSession } from "next-auth/react";
import SetUpOrg from "@/app/components/SetUpOrg";
import { error } from "console";
import { useOrganization } from "@/app/context/OrganizationContext";
import { inputChange } from "@/lib/inputChange";
import useSWR from "swr";
import axiosInstance from "@/lib/axiosInstance";
import useSWRMutation from "swr/mutation";

type Deal = {
  id: string;
  name: string;
  amount: number;
  status: "Pending" | "Won" | "Lost";
  owner: string;
  ownerId: string;
  lastInteraction: string;
};

// const dummyDeals: Deal[] = [
//   {
//     id: "1",
//     dealName: "Website Redesign",
//     amount: 5000,
//     status: "Pending",
//     owner: "John Doe",
//   },
//   {
//     id: "2",
//     dealName: "Mobile App Project",
//     amount: 15000,
//     status: "Won",
//     owner: "Jane Smith",
//   },
//   {
//     id: "3",
//     dealName: "SEO Optimization",
//     amount: 3000,
//     status: "Lost",
//     owner: "Alice Johnson",
//   },
// ];

const columns = [
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

const statusSelect = [
  { key: "pending", label: "Pending" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];

const capitalizeStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const dealsDataFormatter = (apiData: []) => {
  console.log("apiData: ", apiData);
  return apiData.map((lead: any) => ({
    id: lead.id,
    name: lead.name,
    amount: lead.amount || "Unknown",
    status: capitalizeStatus(lead.status) || "Unknown",
    owner: lead.owner.name || "Unknown",
    ownerId: lead.owner.id || "Unknown",
    lastInteraction: lead.updatedAt.split("T")[0],
  }));
};

const handleInitDealsData = async (refData: string) => {
  console.log("handleInitDealsData", refData);
  if (!refData) return;

  const [_, email, selectedOrg] = refData.split("::");

  const respone = await axiosInstance.get("/deals/fetch-deals-data", {
    params: {
      email,
      selectedOrg,
    },
  });

  if (respone.data.error) throw new Error("error: ", respone.data.error);

  console.log("handleInitDealsData ", respone.data.userRole);
  console.log("handleInitDealsData ", respone.data.dealsData);

  const formatedData = dealsDataFormatter(respone.data.dealsData);
  console.log("formatedData ", formatedData);

  return {
    formatedDealsData: formatedData,
    userRole: respone.data.userRole.role,
  };
};

const sendRequestAddDeal = async (url: string, { arg }: { arg: any }) => {
  console.log("url: ", url);
  console.log("arg: ", arg);
  const response = await axiosInstance.post(url, arg);
  if (response.data.error) throw new Error("error: ", response.data.error);
  console.log("addeddata: ", response.data);
  return "ok";
};

const sendRequestToUpdateDeal = async (url: string, { arg }: { arg: any }) => {
  console.log("url: ", url);
  console.log("arg: ", arg);
  const response = await axiosInstance.post(url, arg);
  if (response.data.error) throw new Error("error: ", response.data.error);
  console.log("addeddate: ", response.data);
  return "ok";
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

const sendRequestDeleteDeal = async (url: string, { arg }: { arg: any }) => {
  console.log("url: ", url);
  console.log("arg: ", arg);
  const response = await axiosInstance.post(url, arg);
  if (response.data.error) throw new Error("error: ", response.data.error);
  console.log("deletedData: ", response.data);
  return "ok";
};

export default function DealsPage() {
  const { data: session, status } = useSession();
  const [initDealsDataLoading, setInitDealsLoading] = useState<boolean>(true);

  const componentName = useMemo(() => "LeadsPage", []);
  const errorImageURL = useMemo(() => "/circle-exclamation-solid.svg", []);

  const { selectedOrg, organizations } = useOrganization();

  const [isOpenSideBar, setIsOpenSideBar] = useState<boolean>(true);
  const toggleSidebar = () => setIsOpenSideBar((prev) => !prev);
  // const [deals, setDeals] = useState<Deal[]>(dummyDeals);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [purposefunc, setPurposeFunc] = useState<string>("");

  const [form, setForm] = useState<any>({
    name: "",
    amount: 0,
    status: "",
    owner: "",
  });

  const [error, setError] = useState<any>({
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
  } = useSWRMutation("/deals/delete-deal", sendRequestDeleteDeal);

  const {
    data: insertedDeal,
    trigger: triggerAddDeal,
    isMutating: ismutatingDeal,
  } = useSWRMutation("/deals/add-deal", sendRequestAddDeal);

  const {
    data: updatedDeal,
    trigger: triggerUpdateDeal,
    isMutating: isMutatingUpdateDeal,
  } = useSWRMutation("/deals/update-deal", sendRequestToUpdateDeal);

  const initDealsDataKey =
    session?.user?.email && selectedOrg
      ? `fetch-deals-data::${session.user.email}::${selectedOrg}`
      : null;

  const {
    data: initDealsData,
    error: errorinitDealsData,
    isLoading: isLoadingDealsData,
    mutate,
  } = useSWR(initDealsDataKey ? initDealsDataKey : null, handleInitDealsData, {
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

  const clearForm = () => {
    setForm({ name: "", amount: 0, status: "", owner: "" });
  };

  const handleOpenModal = (purpose: string, form?: Deal) => {
    console.log("form: ", form);
    setPurposeFunc(purpose);
    switch (purpose) {
      case "edit":
        console.log("handleOpenModal: ", form);
        setForm({ ...form, owner: form?.ownerId });
        break;
      case "add":
        clearForm();
        break;
      default:
        break;
    }

    onOpen();
  };

  const handleSubmitFrom = async (
    onClose: () => void,
    orgID: string,
    form: any
  ) => {
    console.log("handleSubmitFrom: ", form);
    switch (purposefunc) {
      case "edit":
        await triggerUpdateDeal({
          dealId: form.id,
          name: form.name,
          amount: form.amount,
          status: form.status,
          ownerId: form.owner,
        });
        clearForm();
        break;
      case "add":
        await triggerAddDeal({
          selectedOrg: orgID,
          name: form.name,
          amount: form.amount,
          status: form.status,
          userid: form.owner,
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
                          {columns.map((column) => (
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
                                          | "Pending"
                                          | "Won"
                                          | "Lost",
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
                                    item.status === "Pending"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : item.status === "Won"
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
              <ModalHeader>Add New categorized Lead</ModalHeader>
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
                      value={form.amount}
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
                      {manageOrgUserData?.agentList?.map((agent: any) => (
                        <SelectItem key={agent.id}>{agent.name}</SelectItem>
                      ))}
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
                      {statusSelect?.map((status: any) => (
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
