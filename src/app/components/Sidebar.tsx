"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
} from "@heroui/react";
import Link from "next/link";
import UserAvatar from "@/app/components/UserAvatar";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useOrganization } from "@/app/context/OrganizationContext";
import { cache } from "swr/_internal";
import useSWR, { useSWRConfig } from "swr";
import axiosInstance from "@/app/lib/axiosInstance";
import type { Notification } from "@prisma/client";
import {
  FiBarChart2,
  FiBell,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiLock,
  FiMessageSquare,
  FiPlus,
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

const createOrganizationKey = "__create_organization__";

type OrganizationSelectItem = {
  key: string;
  name: string;
  role?: string;
  isCreateAction?: boolean;
};

type NotificationItem = Omit<Notification, "createdAt"> & {
  createdAt: string;
};

type NotificationsResponse = {
  notifications: NotificationItem[];
};

const fetchNotifications = async () => {
  const response = await axiosInstance.get<NotificationsResponse>("/notifications");
  return response.data.notifications;
};

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
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    repeatNewPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    repeatNewPassword: "",
    form: "",
    success: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { mutate } = useSWRConfig();
  const notificationKey = session?.user?.email ? "/notifications" : null;
  const { data: notifications = [] } = useSWR(
    notificationKey,
    fetchNotifications,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );
  const hasUnreadNotifications = notifications.some((notification) => !notification.read);
  const shownNotifications = useMemo(
    () => notifications.slice(0, 8),
    [notifications]
  );

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
    if (orgId === createOrganizationKey) {
      router.push("/organization");
      return;
    }

    console.log("changedorgID: ", orgId);
    setSelectedOrg(orgId);
  };
  const isActiveRoute = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const handleNotificationClick = async (notification: NotificationItem) => {
    setIsNotificationOpen(false);

    if (notification.organizationId) {
      setSelectedOrg(notification.organizationId);
    }

    if (notificationKey) {
      const optimisticNotifications = notifications.map((item) =>
        item.id === notification.id ? { ...item, read: true } : item
      );

      await mutate(
        notificationKey,
        async () => {
          await axiosInstance.patch("/notifications", {
            notificationId: notification.id,
          });
          return optimisticNotifications;
        },
        {
          optimisticData: optimisticNotifications,
          rollbackOnError: true,
          revalidate: false,
        }
      );
    }

    router.push(notification.href);
  };

  const validatePasswordForm = () => {
    const errors = {
      currentPassword: "",
      newPassword: "",
      repeatNewPassword: "",
      form: "",
      success: "",
    };

    if (!passwordForm.currentPassword.trim()) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordForm.newPassword.trim()) {
      errors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 12) {
      errors.newPassword = "New password must be at least 12 characters";
    } else if (passwordForm.newPassword === passwordForm.currentPassword) {
      errors.newPassword = "New password must be different";
    }

    if (!passwordForm.repeatNewPassword.trim()) {
      errors.repeatNewPassword = "Repeat new password is required";
    } else if (passwordForm.repeatNewPassword !== passwordForm.newPassword) {
      errors.repeatNewPassword = "New passwords do not match";
    }

    setPasswordErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const closeChangePassword = () => {
    setIsChangePasswordOpen(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      repeatNewPassword: "",
    });
    setPasswordErrors({
      currentPassword: "",
      newPassword: "",
      repeatNewPassword: "",
      form: "",
      success: "",
    });
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    setIsChangingPassword(true);
    setPasswordErrors((prev) => ({ ...prev, form: "", success: "" }));

    try {
      await axiosInstance.post("/auth/change-password", passwordForm);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        repeatNewPassword: "",
      });
      setPasswordErrors({
        currentPassword: "",
        newPassword: "",
        repeatNewPassword: "",
        form: "",
        success: "Password changed successfully.",
      });
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "error" in error.response.data &&
        typeof error.response.data.error === "string"
          ? error.response.data.error
          : "Unable to change password.";

      setPasswordErrors((prev) => ({ ...prev, form: message }));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const organizationSelectItems: OrganizationSelectItem[] = [
    {
      key: createOrganizationKey,
      name: "Organization",
      isCreateAction: true,
    },
    ...organizations.map((org) => ({
      key: org.organization.id,
      name: org.organization.name,
      role: org.role,
    })),
  ];

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
          <Select<OrganizationSelectItem>
            disabled={isLoading}
            className="max-w-xs"
            items={organizationSelectItems}
            selectedKeys={selectedOrg ? [selectedOrg] : []}
            onChange={handleOrgChange}
            label="Organization"
            classNames={{
              trigger: "text-black",
            }}
          >
            {(item) => (
              <SelectItem
                key={item.key}
                textValue={item.name}
                startContent={item.isCreateAction ? <FiPlus size={18} /> : null}
                isReadOnly={!item.isCreateAction && item.key === selectedOrg}
              >
                {item.isCreateAction
                  ? item.name
                  : `${item.name} (${item.role})`}
              </SelectItem>
            )}
          </Select>
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

        <div className={`mt-auto flex items-center ${isCollapsed ? "justify-center" : "gap-2"}`}>
          <Popover
            isOpen={isOpen}
            onOpenChange={(open) => setIsOpen(open)}
          >
            <PopoverTrigger>
              <div className="min-w-0 flex-1 cursor-pointer rounded p-2 text-black hover:bg-gray-300">
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
              <div className="flex min-w-44 flex-col gap-2 px-1 py-2">
                <Button
                  variant="light"
                  startContent={<FiLock size={16} />}
                  onPress={() => {
                    setIsOpen(false);
                    setIsChangePasswordOpen(true);
                  }}
                >
                  Change password
                </Button>
                <Button color="danger" onPress={handleLogout}>
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {!isCollapsed && (
            <Popover
              isOpen={isNotificationOpen}
              onOpenChange={(open) => setIsNotificationOpen(open)}
              placement="top-end"
            >
              <PopoverTrigger>
                <button
                  aria-label="Notifications"
                  title="Notifications"
                  className="relative rounded p-2 text-gray-700 hover:bg-gray-300 hover:text-black"
                >
                  <FiBell size={20} />
                  {hasUnreadNotifications && (
                    <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="w-72 px-1 py-2">
                  <p className="px-2 pb-2 text-sm font-semibold text-gray-900">
                    Notifications
                  </p>
                  {shownNotifications.length === 0 ? (
                    <p className="px-2 py-4 text-sm text-gray-500">
                      No notifications yet.
                    </p>
                  ) : (
                    <div className="flex max-h-80 flex-col overflow-auto">
                      {shownNotifications.map((notification) => (
                        <button
                          key={notification.id}
                          className="rounded px-2 py-2 text-left hover:bg-gray-100"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <span className="flex items-start gap-2">
                            {!notification.read && (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                            )}
                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-gray-900">
                                {notification.title}
                              </span>
                              <span className="block text-xs text-gray-600">
                                {notification.message}
                              </span>
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </nav>
      <Modal
        isOpen={isChangePasswordOpen}
        onOpenChange={(open) => {
          if (!open) closeChangePassword();
          else setIsChangePasswordOpen(true);
        }}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: { duration: 0.2, ease: "easeOut" },
            },
            exit: {
              y: -12,
              opacity: 0,
              transition: { duration: 0.15, ease: "easeIn" },
            },
          },
        }}
      >
        <ModalContent>
          <ModalHeader>Change password</ModalHeader>
          <ModalBody>
            {passwordErrors.form && (
              <p className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {passwordErrors.form}
              </p>
            )}
            {passwordErrors.success && (
              <p className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {passwordErrors.success}
              </p>
            )}
            <Input
              label="Current password"
              type="password"
              value={passwordForm.currentPassword}
              isInvalid={Boolean(passwordErrors.currentPassword)}
              errorMessage={passwordErrors.currentPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  currentPassword: event.target.value,
                }))
              }
            />
            <Input
              label="New password"
              type="password"
              value={passwordForm.newPassword}
              isInvalid={Boolean(passwordErrors.newPassword)}
              errorMessage={passwordErrors.newPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  newPassword: event.target.value,
                }))
              }
            />
            <Input
              label="Repeat new password"
              type="password"
              value={passwordForm.repeatNewPassword}
              isInvalid={Boolean(passwordErrors.repeatNewPassword)}
              errorMessage={passwordErrors.repeatNewPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  repeatNewPassword: event.target.value,
                }))
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={closeChangePassword}>
              Cancel
            </Button>
            <Button
              color="primary"
              isLoading={isChangingPassword}
              onPress={handleChangePassword}
            >
              Update password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </aside>
  );
}
