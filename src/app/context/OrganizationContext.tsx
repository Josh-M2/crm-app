"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import axiosInstance from "@/lib/axiosInstance"; // your axios instance
import { cache } from "swr/_internal";

export type Organization = {
  organization: {
    id: string;
    code: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  role: "AGENT" | "MINER" | "ADMIN";
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
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

//to make types
const fetchOrganizations = async (refData: any) => {
  console.log("fetchOrganizations: ", refData);
  const [message, email] = refData.split("::"); // splits into ["", "user@example.com"]
  const response = await axiosInstance.get("/organization/fetch-org", {
    params: { email: email },
  });

  if (response.data) {
    console.log("fetchedOrganizations: ", response.data.userWithOrganizations);
    return response.data.userWithOrganizations;
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
      JSON.stringify(orgs.map((o: any) => o.organization.id)) ===
      JSON.stringify(organizations.map((o) => o.organization.id));

    if (isSame) return; // Skip unnecessary re-setting

    const storedOrg = localStorage.getItem("selectedOrg");
    const foundOrg = orgs.find((org: any) => org.organization.id === storedOrg);
    const fallbackOrgId = orgs[0].organization.id;

    setOrganizationsState(orgs);
    setSelectedOrgState(foundOrg ? foundOrg.organization.id : fallbackOrgId);

    localStorage.setItem(
      "selectedOrg",
      foundOrg ? foundOrg.organization.id : fallbackOrgId
    );
  }, [orgs]);

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
