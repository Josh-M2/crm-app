"use client";

import React, { useState } from "react";
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
} from "@heroui/react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";

type Deal = {
  id: string;
  dealName: string;
  amount: number;
  status: "Pending" | "Won" | "Lost";
  owner: string;
};

const dummyDeals: Deal[] = [
  {
    id: "1",
    dealName: "Website Redesign",
    amount: 5000,
    status: "Pending",
    owner: "John Doe",
  },
  {
    id: "2",
    dealName: "Mobile App Project",
    amount: 15000,
    status: "Won",
    owner: "Jane Smith",
  },
  {
    id: "3",
    dealName: "SEO Optimization",
    amount: 3000,
    status: "Lost",
    owner: "Alice Johnson",
  },
];

const columns = [
  { key: "dealName", label: "Deal Name" },
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status" },
  { key: "owner", label: "Owner" },
  { key: "actions", label: "Actions" },
];

export default function DealsPage() {
  const [isOpenSideBar, setIsOpenSideBar] = useState<boolean>(true);
  const toggleSidebar = () => setIsOpenSideBar((prev) => !prev);
  const [deals, setDeals] = useState<Deal[]>(dummyDeals);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onOpenChange: onAddOpenChange,
  } = useDisclosure();

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal);
    onOpen();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this deal?")) {
      setDeals((prev) => prev.filter((deal) => deal.id !== id));
    }
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
        className="flex flex-col w-full p-8"
        animate={{ marginLeft: isOpenSideBar ? "16rem" : "0" }} // smooth transition of margin-left (lg:ml-64)
        transition={{ duration: 0.2 }} // Set transition duration for smooth effect
      >
        <div className="ml-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Deals</h2>
            <Button color="primary" onPress={onAddOpen}>
              Add New Deal
            </Button>
          </div>
        </div>
        <Table aria-label="Deals Table">
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key} className="text-center">
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={deals}>
            {(item) => (
              <TableRow key={item.id}>
                {columns.map((column) => (
                  <TableCell key={column.key} className="text-center">
                    {column.key === "actions" ? (
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => handleEdit(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => handleDelete(item.id)}
                        >
                          Delete
                        </Button>
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
      </motion.main>

      <button
        onClick={toggleSidebar}
        className={`absolute top-4 left-4 bg-transparent hover:bg-gray-300 py-2 px-4 rounded-md z-10 ${
          isOpenSideBar ? "hidden" : ""
        }`}
      >
        =
      </button>

      {/* Edit Deal Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit Deal</ModalHeader>
              <ModalBody>
                <p>
                  Editing: <strong>{selectedDeal?.dealName}</strong>
                </p>
                {/* You can add form inputs here if you want to edit */}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose}>
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Add Deal Modal */}
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
