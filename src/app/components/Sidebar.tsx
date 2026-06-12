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
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useOrganization } from "@/app/context/OrganizationContext";
import { cache } from "swr/_internal";
import {
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiMessageSquare,
  FiSettings,
  FiTarget,
  FiUser,
  FiUsers,
} from "react-icons/fi";

type SidebarTypes = {
  toggleSideBar: () => void;
  isCollapsed?: boolean;
  isPinnedOpen?: boolean;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: FiGrid },
  { href: "/leads", label: "Leads", icon: FiUsers },
  { href: "/deals", label: "Deals", icon: FiTarget },
  { href: "/analytics", label: "Analytics", icon: FiBarChart2 },
  { href: "/testimony", label: "Testimony", icon: FiMessageSquare },
  { href: "/settings", label: "Settings", icon: FiSettings },
];

export default function Sidebar({
  toggleSideBar,
  isCollapsed = false,
  isPinnedOpen = true,
}: SidebarTypes) {
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
  const isActiveRoute = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="flex h-screen flex-col bg-white p-4">
      <div
        className={`mb-8 flex items-center ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!isCollapsed && (
          <h1 className="text-2xl font-bold text-black">LeadNest</h1>
        )}
        <button
          aria-label={isPinnedOpen ? "Collapse sidebar" : "Expand sidebar"}
          title={isPinnedOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="rounded p-2 text-black hover:bg-gray-300"
          onClick={toggleSideBar}
        >
          {isPinnedOpen ? (
            <FiChevronLeft size={20} />
          ) : (
            <FiChevronRight size={20} />
          )}
        </button>
      </div>

      {!isCollapsed && (
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
      )}
      <nav className="flex flex-col justify-between h-full ">
        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center rounded py-3 text-gray-700 transition hover:bg-gray-300 hover:text-black ${
                  isCollapsed ? "justify-center px-2" : "gap-3 px-2"
                } ${isActiveRoute(item.href) ? "bg-gray-300" : ""}`}
              >
                <Icon size={20} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        <Popover isOpen={isOpen} onOpenChange={(open) => setIsOpen(open)}>
          <PopoverTrigger>
            <div className="mt-auto cursor-pointer rounded p-2 text-black hover:bg-gray-300">
              {isCollapsed ? (
                <FiUser className="mx-auto" size={20} />
              ) : (
                <UserAvatar
                  description="Member"
                  name={session?.user?.name as string}
                />
              )}
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
