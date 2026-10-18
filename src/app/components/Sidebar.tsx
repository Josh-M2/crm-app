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
} from "@heroui/react";
import Link from "next/link";
import { useMemo, useState } from "react";
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
  FiLogOut,
  FiGrid,
  FiLock,
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
  toggleLabel?: string;
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
  toggleLabel,
}: SidebarTypes) {
  const {
    organizations,
    selectedOrg,
    setOrganizations,
    setSelectedOrg,
    isLoading,
  } = useOrganization();

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
  const { data: session } = useSession();
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

  return (
    <aside className="flex h-screen flex-col bg-white px-3 pb-4 pt-5 sm:px-4">
      <div
        className={`mb-7 flex items-center ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!isCollapsed && (
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5 px-1" aria-label="LeadNest dashboard">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-sm font-black text-white shadow-md shadow-indigo-200">L</span>
            <span className="truncate text-lg font-bold tracking-tight text-slate-900">LeadNest</span>
          </Link>
        )}
        <button
          type="button"
          aria-label={toggleLabel ?? (isPinnedOpen ? "Collapse sidebar" : "Expand sidebar")}
          title={toggleLabel ?? (isPinnedOpen ? "Collapse sidebar" : "Expand sidebar")}
          aria-expanded={isPinnedOpen}
          className="rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
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
        <div className="mb-7 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
          <label htmlFor="sidebar-organization" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">Organization</label>
          <select
            id="sidebar-organization"
            disabled={isLoading}
            value={selectedOrg || ""}
            onChange={handleOrgChange}
            className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none disabled:opacity-60"
          >
            {!selectedOrg && <option value="">Select an organization</option>}
            {organizations.map((org) => (
              <option key={org.organization.id} value={org.organization.id}>{org.organization.name}</option>
            ))}
            <option value={createOrganizationKey}>+ Create or join organization</option>
          </select>
        </div>
      )}
      <nav aria-label="Workspace navigation" className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {!isCollapsed && <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Workspace</p>}
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                aria-label={isCollapsed ? item.label : undefined}
                aria-current={isActiveRoute(item.href) ? "page" : undefined}
                className={`group flex min-h-11 items-center rounded-xl py-2.5 text-sm font-medium transition-colors ${
                  isCollapsed ? "justify-center px-2" : "gap-3 px-3"
                } ${isActiveRoute(item.href) ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
              >
                <Icon size={19} className="shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
                {!isCollapsed && isActiveRoute(item.href) && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600" />}
              </Link>
            );
          })}
        </div>

        <div className={`mt-4 flex shrink-0 items-center border-t border-slate-200 pt-4 ${isCollapsed ? "flex-col justify-center gap-1" : "gap-2"}`}>
          <Popover
            isOpen={isOpen}
            onOpenChange={(open) => setIsOpen(open)}
          >
            <PopoverTrigger>
              <button
                type="button"
                aria-label="Account menu"
                className={`flex min-h-12 cursor-pointer items-center rounded-xl p-2 text-left text-slate-900 transition-colors hover:bg-slate-100 ${isCollapsed ? "w-full justify-center" : "min-w-0 flex-1"}`}
              >
                {isCollapsed ? (
                  <FiUser className="mx-auto" size={20} />
                ) : (
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                      {(session?.user?.name ?? "M").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold leading-5">{session?.user?.name ?? "Member"}</span>
                      <span className="block text-xs text-slate-500">Account</span>
                    </span>
                  </span>
                )}
              </button>
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
                <Button color="danger" variant="light" startContent={<FiLogOut size={16} />} onPress={handleLogout}>
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover
              isOpen={isNotificationOpen}
              onOpenChange={(open) => setIsNotificationOpen(open)}
              placement="top-end"
            >
              <PopoverTrigger>
                <button
                  aria-label="Notifications"
                  title="Notifications"
                  className="relative shrink-0 rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
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
