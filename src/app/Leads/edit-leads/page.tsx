"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation"; // Using useSearchParams
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { motion } from "framer-motion";
import Sidebar from "@/app/components/Sidebar";

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
];

export default function EditLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(dummyLeads);
  const searchParams = useSearchParams();
  const owner = searchParams.get("owner"); // Get the 'owner' query parameter
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

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
        animate={{ x: isOpen ? 0 : -256 }} // Slide in/out based on isOpen state
        exit={{ x: -256 }} // Same for exit animation
        transition={{ duration: 0.01 }} // Smooth transition settings
      >
        <Sidebar toggleSideBar={toggleSidebar} />
      </motion.div>

      <motion.main
        className="flex flex-col w-full p-8  mx-auto p-6"
        animate={{ marginLeft: isOpen ? "16rem" : "0" }} // smooth transition of margin-left (lg:ml-64)
        transition={{ duration: 0.2 }} // Set transition duration for smooth effect
      >
        {/* Header */}
        <h2 className="text-3xl font-bold mb-4 ml-10">Leads for {owner}</h2>
        <p className="text-lg mb-8 ml-10">
          Manage and edit the leads of {owner}.
        </p>

        {/* Leads Table */}

        <Table>
          <TableHeader>
            <TableColumn className="text-center" key="name">
              Name
            </TableColumn>
            <TableColumn className="text-center" key="company">
              Company
            </TableColumn>
            <TableColumn className="text-center" key="email">
              Email
            </TableColumn>
            <TableColumn className="text-center" key="status">
              Status
            </TableColumn>
            <TableColumn className="text-center" key="lastInteraction">
              Last Interaction
            </TableColumn>
            <TableColumn className="text-center" key="actions">
              Actions
            </TableColumn>
          </TableHeader>

          <TableBody items={leadsForOwner}>
            {(lead) => (
              <TableRow key={lead.id}>
                <TableCell>{lead.name}</TableCell>
                <TableCell>{lead.company}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>
                  <span
                    className={`px-3 py-1 rounded-full ${
                      lead.status === "New"
                        ? "bg-blue-500 text-white"
                        : lead.status === "In Progress"
                        ? "bg-yellow-500 text-white"
                        : lead.status === "Converted"
                        ? "bg-green-500 text-white"
                        : "bg-gray-400 text-white"
                    }`}
                  >
                    {lead.status}
                  </span>
                </TableCell>
                <TableCell>{lead.lastInteraction}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
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
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.main>
      {/* The sidebar toggle button */}
      <button
        onClick={toggleSidebar}
        className={`absolute top-4 left-4 bg-transparent hover:bg-gray-300 py-2 px-4 rounded-md z-10 ${
          isOpen ? "hidden" : ""
        }`}
      >
        =
      </button>
    </div>
  );
}
