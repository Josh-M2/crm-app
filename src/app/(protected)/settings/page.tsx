"use client";

import SetUpOrg from "@/app/components/SetUpOrg";
import { SettingsSkeleton } from "@/app/components/ProtectedPageSkeleton";
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

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { selectedOrg, organizations, isLoading } = useOrganization();
  const [inputOrgNameToDelete, setInputOrgNameToDelete] = useState<string>("");
  const router = useRouter();

  //to make types
  const [selectedOrgData, setSelectedOrgData] = useState<Organization>();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
  const handleDeleteOrg = (data: Organization | undefined, onClose: () => void) => {
    if (selectedOrgData?.role !== "ADMIN") return;
    if (!data) return;

    console.log("delete org: ", data);
    if (data.organization.name === inputOrgNameToDelete) {
      setTimeout(() => {
        console.log("deleted: ", data.organization.name);
        onClose();
        //navigate
      }, 1000);
    } else {
      console.error("organization name not matcehd");
    }
  };

  function handleNavigate(): void {
    router.push("/settings/manage-users");
  }

  return (
    <>
      {!session || !session.user?.email || isLoading ? (
            <SettingsSkeleton />
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
                  <div className="flex flex-row justify-end gap-x-2">
                    <div className="flex flex-col mb-5 items-end">
                      <Button onPress={handleNavigate} color="default">
                        Manage Organization Users
                      </Button>
                    </div>
                    <div className="flex flex-col mb-5 items-end">
                      <Button onPress={handleOpenDeleteOrgModal} color="danger">
                        Delete this Organization
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <SetUpOrg />
          )}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                Delete {selectedOrgData?.organization.name}{" "}
              </ModalHeader>
              <ModalBody>
                <p>
                  To delete this organization type &quot;
                  <strong>{selectedOrgData?.organization.name}</strong>&quot; below.
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
