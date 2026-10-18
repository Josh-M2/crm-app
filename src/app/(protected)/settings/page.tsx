"use client";

import Link from "next/link";
import { Button, Snippet } from "@heroui/react";
import { useSession } from "next-auth/react";
import { FiArrowRight, FiSettings, FiUsers } from "react-icons/fi";
import SetUpOrg from "@/app/components/SetUpOrg";
import { SettingsSkeleton } from "@/app/components/ProtectedPageSkeleton";
import { useOrganization } from "@/app/context/OrganizationContext";

export default function SettingsPage() {
  const { status } = useSession();
  const { selectedOrg, organizations, isLoading } = useOrganization();
  const organization = organizations.find((item) => item.organization.id === selectedOrg);

  if (status === "loading" || isLoading) return <SettingsSkeleton />;
  if (!selectedOrg || !organization) return <SetUpOrg />;

  return (
    <div className="space-y-7">
      <header>
        <p className="workspace-kicker mb-2">Workspace / Settings</p>
        <h1 className="workspace-heading">Organization settings</h1>
        <p className="workspace-subtitle mt-2">Manage access and keep your team connected to the right workspace.</p>
      </header>

      <section className="workspace-panel p-6 sm:p-8" aria-labelledby="organization-title">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><FiSettings size={22} aria-hidden="true" /></span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Current organization</p>
            <h2 id="organization-title" className="mt-1 truncate text-2xl font-bold text-slate-900">{organization.organization.name}</h2>
            <p className="mt-1 text-sm text-slate-500">Your role: <span className="font-semibold capitalize text-slate-700">{organization.role.toLowerCase()}</span></p>
          </div>
        </div>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-sm font-bold text-slate-900">Organization invite code</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">Share this code with teammates you want to invite.</p>
          <div className="mt-4 max-w-full overflow-x-auto"><Snippet size="lg" hideSymbol>{organization.organization.code}</Snippet></div>
        </div>
      </section>

      {organization.role === "ADMIN" && (
        <section className="workspace-panel flex flex-wrap items-center justify-between gap-5 p-6 sm:p-8" aria-labelledby="team-title">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700"><FiUsers size={22} aria-hidden="true" /></span>
            <div>
              <h2 id="team-title" className="text-lg font-bold text-slate-900">Team members</h2>
              <p className="mt-1 text-sm text-slate-500">Review access, roles, and organization requests.</p>
            </div>
          </div>
          <Button as={Link} href="/settings/manage-users" color="primary" className="rounded-xl font-semibold" endContent={<FiArrowRight aria-hidden="true" />}>Manage team</Button>
        </section>
      )}

      <p className="text-sm text-slate-500">Need help with your organization? <Link href="/contact" className="font-semibold text-indigo-700 hover:underline">Contact LeadNest</Link>.</p>
    </div>
  );
}
