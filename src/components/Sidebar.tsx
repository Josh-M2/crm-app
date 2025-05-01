import { Button, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import { useEffect, useState } from "react";
import { redirect, usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

type SidebarTypes = {
  toggleSideBar: () => void;
};

export default function Sidebar({ toggleSideBar }: SidebarTypes) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("");
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
      setActiveSection(pathname);
    }
  }, [pathname]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
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
      <nav className="flex flex-col justify-between h-full ">
        <div className="flex flex-col gap-2">
          <Link
            href="/dashboard"
            className={`text-gray-700 py-3 px-2 rounded transition hover:text-black hover:bg-gray-300 ${
              pathname === "/Dashboard" ? "bg-gray-300" : ""
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/leads"
            className={`text-gray-700 py-3 px-2 rounded transition hover:text-black hover:bg-gray-300 ${
              pathname === "/Leads" ? "bg-gray-300" : ""
            }`}
          >
            Leads
          </Link>
          <Link
            href="/deals"
            className={`text-gray-700 py-3 px-2 rounded transition hover:text-black hover:bg-gray-300 ${
              pathname === "/Deals" ? "bg-gray-300" : ""
            }`}
          >
            Deals
          </Link>
          <Link
            href="/analytics"
            className={`text-gray-700 py-3 px-2 rounded transition hover:text-black hover:bg-gray-300 ${
              pathname === "/Analytics" ? "bg-gray-300" : ""
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
