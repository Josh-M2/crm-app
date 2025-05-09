"use client";

import React, { useState } from "react";
import {
  Button,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
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

export default function LeadsPage() {
  const { data: session, status } = useSession();
  const [initLeadsDataLoading, setInitLeadsDataLoading] =
    useState<boolean>(true);

  //to add types
  const [initLeadsData, setInitLeadsData] = useState<any>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);
  const [isOpenSideBar, setIsOpenSideBar] = useState<boolean>(true);
  const toggleSidebar = () => setIsOpenSideBar((prev) => !prev);
  const router = useRouter();
  const pathname = usePathname();

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onOpenChange: onAddOpenChange,
  } = useDisclosure();

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
    return item[columnKey] || "-"; // Return value of the lead property or "-" if not available
  };

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
        {initLeadsData ? (
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
              <ModalHeader>Add New Deal</ModalHeader>
              <ModalBody>
                <p>Here will be the form to create a new deal.</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose}>
                  Add Deal
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
