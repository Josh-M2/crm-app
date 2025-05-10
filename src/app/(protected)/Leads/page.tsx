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

// Dummy lead data
const leadsData = [
  { id: 1, owner: "John Doe", leadName: "Lead A", assignedto: "Kathy" },
  { id: 2, owner: "Jane Smith", leadName: "Lead B", assignedto: "Kathy" },
  { id: 3, owner: "John Doe", leadName: "Lead C", assignedto: "Me" },
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

export default function LeadsPage() {
  const componentName = useMemo(() => "LeadsPage", []);
  const errorImageURL = useMemo(() => "/circle-exclamation-solid.svg", []);

  const { data: session, status } = useSession();
  const [initLeadsDataLoading, setInitLeadsDataLoading] =
    useState<boolean>(true);

  //to add types
  const [initLeadsData, setInitLeadsData] = useState<any>(null);

  const { selectedOrg, organizations } = useOrganization();

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

  const [selectedOrgData, setSelectedOrgData] = useState<any>();

  // Handle edit action for a specific lead
  const handleEditLead = (owner: string) => {
    // Implement the edit functionality here (e.g., navigate to edit page)
    console.log("Editing lead with ID:", owner);
    if (owner) {
      router.push(`/Leads/edit-leads/?owner=${owner}`);
    }
  };

  // Handle delete action for a specific lead
  const handleDeleteLead = (id: number) => {
    // Implement the delete functionality here (e.g., remove lead from list)
    console.log("Deleting lead with ID:", id);
  };

  // Utility function to get values from each row based on the column key
  const getKeyValue = (item: any, columnKey: string) => {
    // console.log("item: ", item);
    // console.log("columnKey: ", columnKey);

    return item[columnKey] || "-"; // Return value of the lead property or "-" if not available
  };

  const handleCreateOwnerLead = async () => {
    console.log("handlecreateowneroflead");
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
                <h3 className="text-xl font-bold ">
                  Leads for {selectedOwner || "All Owners"}
                </h3>
                <Button color="primary" onPress={onAddOpen}>
                  Add New Owner
                </Button>
              </div>
            </div>

            {/* Table to display leads */}
            <Table>
              <TableHeader columns={columns}>
                {(column) => (
                  <TableColumn key={column.key} className="text-center">
                    {column.label}
                  </TableColumn>
                )}
              </TableHeader>

              <TableBody items={leadsData}>
                {(item) => (
                  <TableRow key={item.id}>
                    {columns.map((column) => (
                      <TableCell key={column.key} className="text-center">
                        {column.key === "actions" ? (
                          // Custom actions column for Edit and Delete buttons
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="light"
                              onPress={() => handleEditLead(item.owner)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() => handleDeleteLead(item.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        ) : (
                          // Display the correct value for each column
                          getKeyValue(item, column.key)
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
              <ModalHeader>Add New Owner</ModalHeader>
              <ModalBody>
                <form className="space-y-6" onSubmit={handleCreateOwnerLead}>
                  <div>
                    <Input
                      isRequired
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
                      isRequired
                      className="max-w-xs"
                      label="Select an animal"
                      name="owner"
                      selectedKeys={[form.owner]}
                      onChange={handleChange}
                    >
                      {animals.map((animal) => (
                        <SelectItem key={animal.key}>{animal.label}</SelectItem>
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
                      disabled={selectedOrgData?.role !== "ADMIN"}
                      className="max-w-xs"
                      label="Assigned to"
                      name="assignedTo"
                      selectedKeys={[form.owner]}
                      onChange={handleChange}
                    >
                      {animals.map((animal) => (
                        <SelectItem key={animal.key}>{animal.label}</SelectItem>
                      ))}
                    </Select>
                  </div>
                  <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button color="primary" type="submit" onPress={onClose}>
                      Add Deal
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
