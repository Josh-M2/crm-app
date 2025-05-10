"use client";

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
} from "@heroui/react";
import Link from "next/link";
import UserAvatar from "@/app/components/UserAvatar";
import { useEffect, useRef, useState } from "react";
import { redirect, usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import axiosInstance from "@/lib/axiosInstance";
import { useOrganization } from "@/app/context/OrganizationContext";
import { mutate, unstable_serialize } from "swr";
import { cache } from "swr/_internal";

type SidebarTypes = {
  toggleSideBar: () => void;
};

export default function Sidebar({ toggleSideBar }: SidebarTypes) {
  const {
    organizations,
    selectedOrg,
    setOrganizations,
    setSelectedOrg,
    isLoading,
  } = useOrganization();

  useEffect(() => {
    if (organizations) {
      console.log("organizationsSidebasr: ", organizations);
    }
  }, [organizations]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session && status) {
      console.log("session: ", session);
      console.log("status: ", status);
    }
  }, [session, status]);

  useEffect(() => {
    if (pathname) {
      console.log("pathname", pathname);
    }
  }, [pathname]);

  const handleLogout = async () => {
    //deletion of swr cache data
    for (const key of cache.keys()) {
      if (typeof key === "string" && key.includes("fetch-dashboard-data"))
        cache.delete(key);
      if (typeof key === "string" && key.includes("fetch-orgs"))
        cache.delete(key);
      if (typeof key === "string" && key.includes("fetch-invites"))
        cache.delete(key);
      if (typeof key === "string" && key.includes("fetch-org-user"))
        cache.delete(key);
    }
    // const dashboardKey = `fetch-dashboard-data::${session?.user?.email}::${selectedOrg}`;
    // const orgKey = `fetch-orgs::${session?.user?.email}`;

    // console.log("dashboardKey: ", dashboardKey);
    // console.log("orgKey: ", orgKey);

    // await mutate(dashboardKey, undefined, { revalidate: false });
    // await mutate(orgKey, undefined, { revalidate: false });

    //resetting global context
    setSelectedOrg(""); //reset the fking selected org
    setOrganizations([]); //reset the fffkijng oragnizations

    localStorage.removeItem("selectedOrg");
    await signOut({ redirect: false });
    router.push("/login");
  };

  const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const orgId = e.target.value;
    console.log("changedorgID: ", orgId);
    setSelectedOrg(orgId);
  };
  return (
    <aside className="w-64 bg-white border-r hidden md:flex flex-col p-6 h-screen fixed">
      <div className="flex flex-row justify-between align-center items-center mb-8">
        <h1 className="text-2xl font-bold  text-black">LeadNest</h1>
        <button
          className="text-md text-black px-4 py-2 rounded hover:bg-gray-300"
          onClick={toggleSideBar}
        >
          {"<-"}
        </button>
      </div>

      <div className="mb-4">
        {organizations.length > 0 ? (
          <Select
            disabled={isLoading}
            className="max-w-xs"
            selectedKeys={selectedOrg ? [selectedOrg] : []}
            onChange={handleOrgChange}
            label="Organization"
            classNames={{
              trigger: "text-black",
            }}
          >
            {organizations.map((org) => (
              <SelectItem
                key={org.organization.id}
                textValue={org.organization.name}
                isReadOnly={org.organization.id === selectedOrg}
              >
                {org.organization.name} ({org.role})
              </SelectItem>
            ))}
          </Select>
        ) : (
          "" //loaders hera or fucking org selectionsada
        )}
      </div>
      <nav className="flex flex-col justify-between h-full ">
        <div className="flex flex-col gap-2">
          <Link
            href="/dashboard"
            className={`text-gray-700 py-3 px-2 rounded transition hover:text-black hover:bg-gray-300 ${
              pathname === "/dashboard" ? "bg-gray-300" : ""
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/leads"
            className={`text-gray-700 py-3 px-2 rounded transition hover:text-black hover:bg-gray-300 ${
              pathname === "/leads" ? "bg-gray-300" : ""
            }`}
          >
            Leads
          </Link>
          <Link
            href="/deals"
            className={`text-gray-700 py-3 px-2 rounded transition hover:text-black hover:bg-gray-300 ${
              pathname === "/deals" ? "bg-gray-300" : ""
            }`}
          >
            Deals
          </Link>
          <Link
            href="/analytics"
            className={`text-gray-700 py-3 px-2 rounded transition hover:text-black hover:bg-gray-300 ${
              pathname === "/analytics" ? "bg-gray-300" : ""
            }`}
          >
            Analytics
          </Link>
          <Link
            href="/settings"
            className={`text-gray-700 py-3 px-2 rounded transition hover:text-black hover:bg-gray-300 ${
              pathname === "/settings" ? "bg-gray-300" : ""
            }`}
          >
            Settings
          </Link>
        </div>

        <Popover isOpen={isOpen} onOpenChange={(open) => setIsOpen(open)}>
          <PopoverTrigger>
            <div className="mt-auto text-black hover:bg-gray-300 p-2 cursor-pointer rounded">
              <UserAvatar
                description="Member"
                name={session?.user?.name as string}
              />
              .
            </div>
          </PopoverTrigger>
          <PopoverContent>
            <div className="px-1 py-2">
              <div className="text-small font-bold">
                <Button color="danger" onPress={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </nav>
    </aside>
  );
}
