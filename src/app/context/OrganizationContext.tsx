"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import axiosInstance from "@/lib/axiosInstance"; // your axios instance

type Organization = {
  id: string;
  name: string;
  role: "Owner" | "Member";
};

type OrgContextType = {
  selectedOrg: string | null;
  organizations: Organization[];
  setSelectedOrg: (id: string) => void;
  isLoading: boolean;
};

// Define context
const OrganizationContext = createContext<OrgContextType | undefined>(
  undefined
);

//to make types
const fetchOrganizations = async (refData: any) => {
  console.log("fetchOrganizations: ", refData);
  const res = await axiosInstance.get("/organization/fetch-org", {
    params: { email: refData.email },
  });

  const { owned, notOwned } = res.data.data;

  const ownedWithRole = (owned || []).map((org: any) => ({
    ...org,
    role: "Owner",
  }));

  const notOwnedWithRole = (notOwned || []).map((org: any) => ({
    ...org,
    role: "Member",
  }));

  return [...ownedWithRole, ...notOwnedWithRole];
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
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  console.log("calling context data");

  const { data: orgs, isLoading } = useSWR(
    session?.user?.email
      ? { message: "fetch-orgs", email: session.user.email }
      : null,
    fetchOrganizations,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  useEffect(() => {
    console.log("orgs: ", orgs);
    if (orgs && orgs.length > 0) {
      console.log("orgs: orgs:", orgs);

      const storedOrg = localStorage.getItem("selectedOrg");

      console.log("storedOrg", storedOrg);

      const foundOrg = orgs.find((org) => org.id === storedOrg);

      console.log("storedOrg", storedOrg);

      const fallbackOrgId = orgs[0].id;

      console.log("fallbackOrgId", fallbackOrgId);

      setOrganizations(orgs);
      setSelectedOrgState(foundOrg ? foundOrg.id : fallbackOrgId);

      localStorage.setItem(
        "selectedOrg",
        foundOrg ? foundOrg.id : fallbackOrgId
      );
    }
  }, [orgs]);

  const setSelectedOrg = (id: string) => {
    setSelectedOrgState(id);
    localStorage.setItem("selectedOrg", id);
  };

  return (
    <OrganizationContext.Provider
      value={{ selectedOrg, organizations, setSelectedOrg, isLoading }}
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
