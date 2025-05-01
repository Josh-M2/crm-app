"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation"; // Using useSearchParams
import {
  Button,
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
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";

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

export default function EditLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(dummyLeads);
  const searchParams = useSearchParams();
  const owner = searchParams.get("owner"); // Get the 'owner' query parameter
  const [isOpenSideBar, setIsOpenSideBar] = useState<boolean>(true);
  const toggleSidebar = () => setIsOpenSideBar((prev) => !prev);
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onOpenChange: onAddOpenChange,
  } = useDisclosure();

  if (!owner) {
    return <div>Error: No owner found in the query parameters.</div>;
  }

  // Filter the leads based on the owner query param
  const leadsForOwner = leads;

  const handleEditLead = (id: string) => {
    // Navigate to the edit page for this lead ID
    alert(`Navigating to edit lead with ID: ${id}`);
  };

  const handleDeleteLead = (id: string) => {
    // Logic for deleting a lead
    alert(`Lead with ID ${id} deleted.`);
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
        className="flex flex-col w-full p-8  mx-auto p-6"
        animate={{ marginLeft: isOpenSideBar ? "16rem" : "0" }} // smooth transition of margin-left (lg:ml-64)
        transition={{ duration: 0.2 }} // Set transition duration for smooth effect
      >
        {/* Header */}

        <div className="flex justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-4 ml-10">Leads for {owner}</h2>
            <p className="text-lg mb-8 ml-10">
              Manage and edit the leads of {owner}.
            </p>
          </div>
          <div className="flex items-end">
            <Button color="primary" onPress={onAddOpen}>
              Add New Lead
            </Button>
          </div>
        </div>

        {/* Leads Table */}

        <Table>
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key} className="text-center">
                {column.label}
              </TableColumn>
            )}
          </TableHeader>

          <TableBody items={leadsForOwner}>
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
                            : lead.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-700"
                            : lead.status === "Converted"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {lead.status}
                      </span>
                    ) : column.key === "lastInteraction" ? (
                      lead.lastInteraction
                    ) : column.key === "actions" ? (
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="light"
                          size="sm"
                          onPress={() => handleEditLead(lead.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="light"
                          size="sm"
                          color="danger"
                          onPress={() => handleDeleteLead(lead.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    ) : null}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
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
