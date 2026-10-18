"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
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
  const [, email] = refData.split("::"); // splits into ["", "user@example.com"]
  const response = await axiosInstance.get<FetchOrganizationsResponse>(
    "/organization/fetch-org",
    {
      params: { email: email },
    }
  );

  const data = response.data;

  if (data) {
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
  const [selectedOrg, setSelectedOrgState] = useState<string | null>(null);
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
    localStorage.setItem("selectedOrg", id);
  };

  const setOrganizations = (data: Organization[]) => {
    setOrganizationsState(data);
  };

  useEffect(() => {
    if (!orgs) return;

    const storedOrg = localStorage.getItem("selectedOrg");
    const foundOrg = orgs.find((org) => org.organization.id === storedOrg);
    const nextOrgId = foundOrg?.organization.id ?? orgs[0]?.organization.id ?? null;

    setOrganizationsState(orgs);
    setSelectedOrgState(nextOrgId);
    if (nextOrgId) localStorage.setItem("selectedOrg", nextOrgId);
    else localStorage.removeItem("selectedOrg");
  }, [orgs]);

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
