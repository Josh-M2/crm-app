"use client";

import SetUpOrg from "@/app/components/SetUpOrg";
import Sidebar from "@/app/components/Sidebar";
import {
  Organization,
  useOrganization,
} from "@/app/context/OrganizationContext";
import {
  Button,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Snippet,
  useDisclosure,
} from "@heroui/react";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [isOpenSideBar, setIsOpenSideBar] = useState<boolean>(true);
  const { selectedOrg, organizations, isLoading } = useOrganization();
  const [inputOrgNameToDelete, setInputOrgNameToDelete] = useState<string>("");

  //to make types
  const [selectedOrgData, setSelectedOrgData] = useState<Organization>();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const toggleSidebar = () => {
    setIsOpenSideBar((prev) => !prev);
  };
  useEffect(() => {
    if (selectedOrg && organizations) {
      console.log("runs");
      console.log("selectedOrgsettings: ", selectedOrg);
      console.log("organizationssettings: ", organizations);

      //return a copy of selected organization
      const orgData = organizations
        .slice()
        .filter((org) => org.organization.id === selectedOrg);
      if (orgData) {
        console.log("orgData: ", orgData[0]);

        setSelectedOrgData(orgData[0]);
      }
    }
  }, [organizations, selectedOrg]);

  const handleOpenDeleteOrgModal = () => {
    onOpen();
  };

  //to make types
  //mockinshit
  const handleDeleteOrg = (data: any, onClose: any) => {
    if (selectedOrgData?.role !== "ADMIN") return;

    console.log("delete org: ", data);
    if (data.name === inputOrgNameToDelete) {
      setTimeout(() => {
        console.log("deleted: ", data.name);
        onClose();
        //navigate
      }, 1000);
    } else {
      console.error("organization name not matcehd");
    }
  };

  return (
    <>
      <div className="min-h-screen flex bg-gray-50">
        <motion.div
          className="bg-gray-800 text-white w-64 h-full fixed top-0 left-0 z-30 transition-all duration-300"
          initial={{ x: -256 }} // Start hidden on the left
          animate={{ x: isOpenSideBar ? 0 : -256 }} // Slide in/out based on isOpenSideBar state
          exit={{ x: -256 }} // Same for exit animation
          transition={{ duration: 0.01 }} // Smooth transition settings
        >
          <Sidebar toggleSideBar={toggleSidebar} />
        </motion.div>

        {/* Main Content */}
        <motion.main
          className="flex flex-col w-full p-8"
          animate={{ marginLeft: isOpenSideBar ? "16rem" : "0" }} // smooth transition of margin-left (lg:ml-64)
          transition={{ duration: 0.2 }} // Set transition duration for smooth effect
        >
          {!session || !session.user?.email || isLoading ? (
            "" //loadershit here
          ) : selectedOrg && !isLoading && organizations ? (
            <>
              <div className="place-items-center mb-5">
                <h2 className="text-3xl font-bold ">
                  {selectedOrgData?.organization.name}
                </h2>
              </div>

              <div className="flex flex-col">
                <div className="flex flex-col mb-5">
                  <label htmlFor="org-code">Organization invite code</label>
                  <Snippet size="lg" hideSymbol={true}>
                    {selectedOrgData?.organization.code}
                  </Snippet>
                </div>
                <Divider className="my-4" />
                {/* <div className="flex flex-col mb-5">
            <label htmlFor="org-code">Organization invite code</label>
            <Snippet size="lg">code here</Snippet>
          </div> */}
                {selectedOrgData?.role === "ADMIN" && (
                  <div className="flex flex-col mb-5 items-end">
                    <Button onPress={handleOpenDeleteOrgModal} color="danger">
                      Delete this Organization
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <SetUpOrg />
          )}
        </motion.main>

        {/* make this a component  */}

        <button
          onClick={toggleSidebar}
          className={`absolute top-4 left-4 bg-transparent hover:bg-gray-300 py-2 px-4 rounded-md z-10 ${
            isOpenSideBar ? "hidden" : ""
          }`}
        >
          =
        </button>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                Delete {selectedOrgData?.organization.name}{" "}
              </ModalHeader>
              <ModalBody>
                <p>
                  To delete this organization type "
                  <strong>{selectedOrgData?.organization.name}</strong>" below.
                </p>

                <Input
                  label="Organization name"
                  type="text"
                  name="organiztin-delete"
                  value={inputOrgNameToDelete}
                  onChange={(e) => setInputOrgNameToDelete(e.target.value)}
                />
                <p className="text-sm">
                  This action cannot be revert. all datas in this organization
                  will be deleted from the database (e.g leads, deals, users of
                  the organization, analytics etc.)
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={() => handleDeleteOrg(selectedOrgData, onClose)}
                >
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
