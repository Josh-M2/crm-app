"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  Divider,
  Tab,
  Tabs,
} from "@heroui/react";
import optionSVG from "@/app/assets/elipse-vertical.svg";
import arrowLeftSVG from "@/app/assets/arrow-left.svg";
import Image from "next/image";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useOrganization } from "@/app/context/OrganizationContext";
import axiosInstance from "@/lib/axiosInstance";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cache } from "swr/_internal";

type orgRequestType = {
  id: string;
  accepted: boolean;
  code: string;
  email: string;
  createdAt: string;
  organizationId: string;
};

const handleFetchInviteData = async (refData: string) => {
  if (!refData) {
    return console.error("no refData refData");
  }
  const [_, selectedOrg] = refData.split("::");

  const response = await axiosInstance.get(
    "/organization/join-org/fetch-requests",
    {
      params: {
        selectedOrg: selectedOrg,
      },
    }
  );

  if (response?.data.error) {
    throw new Error(`Error: ${response.data.error.status}`);
  }

  console.log("handleFetchInviteData123: ", response.data);

  return response.data;
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

  return response.data;
};

export default function manageUser() {
  const { data: session, status } = useSession();
  const { selectedOrg } = useOrganization();
  const router = useRouter();
  const [requestData, setRequestData] = useState<orgRequestType[]>();
  const [orgUserData, setOrgUserData] = useState<any>();

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
    error: errorUserRequest,
    isLoading: isLoadingUserRequest = true,
    mutate: mutateUserRequest,
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
    error: errorOrgUser,
    isLoading: isLoadingOrgUserData = true,
    mutate: mutateOrgUser,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-20 lg:mx-64">
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
                  ? "loadingasd"
                  : orgUserData?.map((user: any, index: number) => (
                      <li
                        className="flex items-center justify-between p-4 flex-wrap sm:flex-nowrap"
                        key={index}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {user.user.name}
                          </p>
                          <p className="text-sm text-gray-500 break-all">
                            {user.user.email}
                          </p>
                        </div>
                        <button className="mt-2 sm:mt-0 text-sm px-4 py-2 text-white rounded hover:bg-gray-300">
                          <Image
                            src={optionSVG}
                            alt="option"
                            width={5}
                            height={5}
                          />
                        </button>
                      </li>
                    ))}
              </ul>
            </div>
          </Tab>
          <Tab key="Requests" title="Requests">
            <Divider className="my-4" />
            <div className="w-full mx-auto bg-white shadow-md rounded-md max-h-[30rem] overflow-auto">
              <ul className="divide-y">
                {isLoadingUserRequest || !requestData
                  ? "loading asdasd"
                  : requestData?.map(
                      //to make types
                      (user: any, index: number) => (
                        <li
                          className="flex items-center justify-between p-4 flex-wrap sm:flex-nowrap"
                          key={index}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {user.email}
                            </p>
                            {/* <p className="text-sm text-gray-500 break-all">
                              johndoe@example.com
                            </p> */}
                          </div>
                          <Button color="danger" className="mx-1">
                            Delete
                          </Button>
                          <Button color="primary" className="mx-1">
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
