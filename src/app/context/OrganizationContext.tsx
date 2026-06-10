"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import axiosInstance from "@/app/lib/axiosInstance"; // your axios instance
import type {
  Organization as PrismaOrganization,
  OrganizationUserRole,
  User,
} from "@prisma/client";

export type Organization = {
  organization: PrismaOrganization;
  role: OrganizationUserRole;
  user?: Pick<User, "id" | "name" | "email" | "createdAt" | "updatedAt">;
};

type OrgContextType = {
  selectedOrg: string | null;
  organizations: Organization[];
  setSelectedOrg: (id: string) => void;
  setOrganizations: (data: Organization[]) => void;
  isLoading: boolean;
};

// Define context
const OrganizationContext = createContext<OrgContextType | undefined>(
  undefined
);

type FetchOrganizationsResponse = {
  userWithOrganizations: Organization[];
};

const fetchOrganizations = async (refData: string): Promise<Organization[]> => {
  console.log("fetchOrganizations: ", refData);
  const [, email] = refData.split("::"); // splits into ["", "user@example.com"]
  const response = await axiosInstance.get<FetchOrganizationsResponse>(
    "/organization/fetch-org",
    {
      params: { email: email },
    }
  );

  const data = response.data;

  if (data) {
    console.log("fetchedOrganizations: ", response.data.userWithOrganizations);
    return data.userWithOrganizations;
  }

  return [];
};

export const OrganizationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: session } = useSession();
  const [selectedOrg, setSelectedOrgState] = useState<string | null>(() => {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem("selectedOrg")
        : null;
    return stored || null;
  });
  const [organizations, setOrganizationsState] = useState<Organization[]>([]);

  const orgKey = session?.user?.email
    ? `fetch-orgs::${session.user.email}`
    : null;

  const { data: orgs, isLoading } = useSWR(
    orgKey ? orgKey : null,
    fetchOrganizations,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const setSelectedOrg = (id: string) => {
    setSelectedOrgState(id);
    //fetch the dashboard data again //rerun the swr sht
    const dashboardKey = `fetch-dashboard-data::${session?.user?.email}::${selectedOrg}`;

    mutate(dashboardKey); // only fetch if nothing's in cache

    localStorage.setItem("selectedOrg", id);
  };

  const setOrganizations = (data: Organization[]) => {
    setOrganizationsState(data);
  };

  useEffect(() => {
    if (!orgs || orgs.length === 0) return;

    const isSame =
      JSON.stringify(orgs.map((o) => o.organization.id)) ===
      JSON.stringify(organizations.map((o) => o.organization.id));

    if (isSame) return; // Skip unnecessary re-setting

    const storedOrg = localStorage.getItem("selectedOrg");
    const foundOrg = orgs.find((org) => org.organization.id === storedOrg);
    const fallbackOrgId = orgs[0].organization.id;

    setOrganizationsState(orgs);
    setSelectedOrgState(foundOrg ? foundOrg.organization.id : fallbackOrgId);

    localStorage.setItem(
      "selectedOrg",
      foundOrg ? foundOrg.organization.id : fallbackOrgId
    );
  }, [orgs, organizations]);

  useEffect(() => {
    if (selectedOrg) console.log("SelectedCurrentOrgID: ", selectedOrg);
  }, [selectedOrg]);

  return (
    <OrganizationContext.Provider
      value={{
        selectedOrg,
        organizations,
        setOrganizations,
        setSelectedOrg,
        isLoading,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const ctx = useContext(OrganizationContext);
  if (!ctx) {
    throw new Error("useOrganization must be used within OrganizationProvider");
  }
  return ctx;
};
