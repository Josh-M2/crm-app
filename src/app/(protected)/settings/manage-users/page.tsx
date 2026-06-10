"use client";

import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tab,
  Tabs,
} from "@heroui/react";
import optionSVG from "@/app/assets/elipse-vertical.svg";
import arrowLeftSVG from "@/app/assets/arrow-left.svg";
import Image from "next/image";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useOrganization } from "@/app/context/OrganizationContext";
import axiosInstance from "@/app/lib/axiosInstance";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cache } from "swr/_internal";
import type {
  Invite,
  OrganizationUserRole,
  User,
} from "@prisma/client";

type OrgRequestType = Invite;
type OrgUserData = {
  id: string;
  role: OrganizationUserRole;
  user: Pick<User, "id" | "name" | "email">;
};
type InviteDataResponse = {
  orgIniviteData: OrgRequestType[];
  error?: string | { status?: number };
};
type OrgUserDataResponse = {
  orgUser: OrgUserData[];
  error?: string | { status?: number };
};

const handleFetchInviteData = async (refData: string) => {
  if (!refData) {
    return { orgIniviteData: [] };
  }
  const [, selectedOrg] = refData.split("::");

  const response = await axiosInstance.get<InviteDataResponse>(
    "/organization/join-org/fetch-requests",
    {
      params: {
        selectedOrg: selectedOrg,
      },
    }
  );

  if (response?.data.error) {
    throw new Error(`Error: ${response.data.error}`);
  }

  console.log("handleFetchInviteData123: ", response.data);

  return response.data;
};

const handleFetchOrgUserData = async (refData: string) => {
  if (!refData) {
    return { orgUser: [] };
  }
  const [, selectedOrg] = refData.split("::");

  const response = await axiosInstance.get<OrgUserDataResponse>(
    "/organization/fetch-org-users",
    {
      params: {
        selectedOrg: selectedOrg,
      },
    }
  );

  if (response?.data.error) {
    throw new Error(`Error: ${response.data.error}`);
  }

  console.log("handleFetchOrgUserData123: ", response.data);

  return response.data;
};

export default function ManageUser() {
  const { data: session } = useSession();
  const { selectedOrg } = useOrganization();
  const router = useRouter();
  const [requestData, setRequestData] = useState<OrgRequestType[]>();
  const [orgUserData, setOrgUserData] = useState<OrgUserData[]>();
  const [, setIsAccepting] = useState<boolean>(false);
  const [, setIsDeleting] = useState<boolean>(false);
  const [, setIsManagingUser] = useState<boolean>(false);

  const manageUserRequestKey =
    session?.user?.email && selectedOrg
      ? `fetch-invites::${selectedOrg}`
      : null;
  const manageOrgUserKey =
    session?.user?.email && selectedOrg
      ? `fetch-org-user::${selectedOrg}`
      : null;

  const {
    data: manageUserRequestData,
    isLoading: isLoadingUserRequest = true,
  } = useSWR(manageUserRequestKey, handleFetchInviteData, {
    dedupingInterval: 60000,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    // onError: (err) => {
    //   console.error("Error fetching dashboard data:", err);
    // },
  });

  useEffect(() => {
    if (manageUserRequestData) {
      console.log("manageUserRequestData: ", manageUserRequestData);
      setRequestData(manageUserRequestData.orgIniviteData);
    }
  }, [manageUserRequestData]);

  const {
    data: manageOrgUserData,
    isLoading: isLoadingOrgUserData = true,
  } = useSWR(manageOrgUserKey, handleFetchOrgUserData, {
    dedupingInterval: 60000,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    // onError: (err) => {
    //   console.error("Error fetching dashboard data:", err);
    // },
  });

  useEffect(() => {
    if (manageOrgUserData) {
      console.log(
        "manageUserRequemanageOrgUserDatastData: ",
        manageOrgUserData
      );
      setOrgUserData(manageOrgUserData.orgUser);
    }
  }, [manageOrgUserData]);

  const handleBackButton = async () => {
    console.log("back button clicked");
    for (const key of cache.keys()) {
      if (typeof key === "string" && key.includes("fetch-invites"))
        cache.delete(key);
      if (typeof key === "string" && key.includes("fetch-org-user"))
        cache.delete(key);
    }
    router.push("/settings");
  };

  const handleAcceptRequest = async (user: OrgRequestType) => {
    setIsAccepting(true);
    const response = await axiosInstance.post(
      "/organization/join-org/accept-request",
      {
        organizationId: selectedOrg,
        inviteId: user.id,
      }
    );
    if (response?.data?.error) {
      throw new Error(`error: ${response.data.error}`);
    }
    console.log("acceptResponse", response.data);
    setIsAccepting(false);
  };

  const handleDeleteRequest = async (userId: string) => {
    console.log("clickeD!", userId);
    setIsDeleting(true);
    const response = await axiosInstance.post(
      "/organization/join-org/delete-request",
      {
        inviteId: userId,
        selectedOrg,
      }
    );

    if (response.data.error) throw new Error(`error: ${response.data.error}`);

    console.log("handleDeleteRequest: ", response.data);
    setIsDeleting(false);
  };

  const handleManageOrgUsers = async (role: string, orgUserId: string) => {
    setIsManagingUser(true);
    const upperCaseRole = role.toUpperCase();
    console.log("orgUserIdajshd: ", orgUserId);
    const response = await axiosInstance.post("/organization/setup-user", {
      role: upperCaseRole,
      orgUserId,
      selectedOrg,
    });

    if (response?.data?.error) throw new Error(`error: ${response.data.error}`);

    console.log("handleManageOrgUsers: ", response.data);
    setIsManagingUser(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-10 lg:mx-64">
        <div>
          <button
            className="mt-5 bg-transparent hover:bg-gray-300 rounded py-3 px-5"
            onClick={handleBackButton}
          >
            <Image src={arrowLeftSVG} alt="option" width={20} height={20} />
          </button>
          <h2 className="text-xl font-semibold py-5">
            Manage User for this Organization
          </h2>
        </div>

        <Tabs aria-label="Options" placement="top">
          <Tab key="Users" title="Users">
            <Divider className="my-4" />

            <div className="w-full mx-auto bg-white shadow-md rounded-md max-h-[30rem] overflow-auto">
              <ul className="divide-y">
                {!orgUserData || isLoadingOrgUserData
                  ? "Loading organization users..."
                  : orgUserData?.map((user) =>
                      user.user.email === session?.user?.email ? null : (
                        <li
                          className="flex items-center justify-between p-4 flex-wrap sm:flex-nowrap"
                          key={user.id}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {user.user.name}
                            </p>
                            <p className="text-sm text-gray-500 break-all">
                              {user.user.email}
                            </p>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {user.role}
                            </p>
                          </div>

                          <Dropdown>
                            <DropdownTrigger>
                              <Button variant="light" size="sm">
                                <Image
                                  src={optionSVG}
                                  alt="option"
                                  width={5}
                                  height={5}
                                  className=""
                                />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Static Actions">
                              {user.role !== "AGENT" ? (
                                <DropdownItem
                                  key="agent"
                                  onPress={() => {
                                    handleManageOrgUsers("agent", user.id);
                                  }}
                                >
                                  Set as Agent
                                </DropdownItem>
                              ) : null}

                              {user.role !== "MINER" ? (
                                <DropdownItem
                                  key="miner"
                                  onPress={() => {
                                    handleManageOrgUsers("miner", user.id);
                                  }}
                                >
                                  Set as Miner
                                </DropdownItem>
                              ) : null}

                              {user.role !== "ADMIN" ? (
                                <DropdownItem
                                  key="admin"
                                  onPress={() => {
                                    handleManageOrgUsers("admin", user.id);
                                  }}
                                >
                                  Set as Admin
                                </DropdownItem>
                              ) : null}

                              <DropdownItem
                                key="remove"
                                className="text-danger"
                                color="danger"
                                onPress={() => {
                                  handleManageOrgUsers("delete", user.id);
                                }}
                              >
                                Remove user
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </li>
                      )
                    )}
              </ul>
            </div>
          </Tab>
          <Tab key="Requests" title="Requests">
            <Divider className="my-4" />
            <div className="w-full mx-auto bg-white shadow-md rounded-md max-h-[30rem] overflow-auto">
              <ul className="divide-y">
                {isLoadingUserRequest || !requestData
                  ? "Loading join requests..."
                  : requestData?.map(
                      //to make types
                      (user) => (
                        <li
                          className="flex items-center justify-between p-4 flex-wrap sm:flex-nowrap"
                          key={user.id}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {user.email}
                            </p>
                            {/* <p className="text-sm text-gray-500 break-all">
                              johndoe@example.com
                            </p> */}
                          </div>
                          <Button
                            color="danger"
                            className="mx-1"
                            onPress={() => {
                              handleDeleteRequest(user.id);
                            }}
                          >
                            Delete
                          </Button>
                          <Button
                            color="primary"
                            className="mx-1"
                            onPress={() => handleAcceptRequest(user)}
                          >
                            Accept
                          </Button>
                        </li>
                      )
                    )}
              </ul>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
