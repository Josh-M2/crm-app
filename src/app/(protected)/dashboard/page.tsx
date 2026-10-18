"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useOrganization } from "@/app/context/OrganizationContext";
import useSWR from "swr";
import { FiArrowRight, FiBarChart2, FiDollarSign, FiTarget, FiUsers } from "react-icons/fi";
import SetUpOrg from "@/app/components/SetUpOrg";
import { DashboardSkeleton } from "@/app/components/ProtectedPageSkeleton";
import { fetchDashboardData } from "@/app/lib/dashboard/api";
import { formatActivitiesFromApi, formatStatsFromApi } from "@/app/lib/dashboard/helpers";

const statIcons = [FiUsers, FiTarget, FiBarChart2, FiDollarSign];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { selectedOrg, isLoading: isLoadingOrg } = useOrganization();
  const dashboardKey = selectedOrg ? `fetch-dashboard-data::${selectedOrg}` : null;
  const { data, error, isLoading, mutate } = useSWR(dashboardKey, fetchDashboardData, {
    revalidateOnFocus: true,
    dedupingInterval: 60000,
  });

  if (status === "loading" || isLoadingOrg || (selectedOrg && isLoading)) {
    return <DashboardSkeleton />;
  }

  if (!selectedOrg) return <SetUpOrg />;

  if (error || !data) {
    return (
      <div className="workspace-panel p-8" role="alert">
        <h1 className="text-xl font-semibold text-slate-900">Dashboard unavailable</h1>
        <p className="mt-2 text-slate-600">We couldn&apos;t load your workspace. Try again.</p>
        <button type="button" onClick={() => mutate()} className="mt-5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Retry</button>
      </div>
    );
  }

  const stats = formatStatsFromApi(data);
  const activities = formatActivitiesFromApi(data);
  const firstName = session?.user?.name?.trim().split(/\s+/)[0] || "there";

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="workspace-kicker mb-2">Workspace overview</p>
          <h1 className="workspace-heading">Welcome back, {firstName}</h1>
          <p className="workspace-subtitle mt-2">Here&apos;s your pipeline at a glance. Pick up where your team left off.</p>
        </div>
        <Link href="/leads" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition-colors hover:bg-indigo-700">
          View leads <FiArrowRight aria-hidden="true" />
        </Link>
      </header>

      <section aria-label="Pipeline metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = statIcons[index];
          return (
            <div key={stat.title} className="workspace-panel p-5 sm:p-6">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Icon size={20} aria-hidden="true" /></div>
              <p className="text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-slate-500">{stat.title}</p>
            </div>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
        <section className="workspace-panel min-h-72 p-6 sm:p-7" aria-labelledby="activity-title">
          <p className="workspace-kicker mb-1">Latest updates</p>
          <h2 id="activity-title" className="text-xl font-bold text-slate-900">Recent activity</h2>
          {activities.length ? (
            <ul className="mt-6 divide-y divide-slate-100">
              {activities.map((activity) => (
                <li key={activity.id} className="flex gap-4 py-4 first:pt-0">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500 ring-4 ring-indigo-50" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-6 text-slate-700">{activity.description}</p>
                    <p className="mt-1 text-xs text-slate-500">{activity.userName} · {activity.timeAgo}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm"><FiBarChart2 size={22} aria-hidden="true" /></div>
              <h3 className="mt-4 font-semibold text-slate-900">Your activity starts here</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">New leads and deal updates will appear here as your team works.</p>
            </div>
          )}
        </section>

        <section className="workspace-panel p-6 sm:p-7" aria-labelledby="next-title">
          <p className="workspace-kicker mb-1">Keep moving</p>
          <h2 id="next-title" className="text-xl font-bold text-slate-900">Quick actions</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Go straight to the work that moves your pipeline forward.</p>
          <div className="mt-6 space-y-3">
            <Link href="/leads" className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"><FiUsers size={19} aria-hidden="true" /> Organize leads <FiArrowRight className="ml-auto" aria-hidden="true" /></Link>
            <Link href="/deals" className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"><FiTarget size={19} aria-hidden="true" /> Review deals <FiArrowRight className="ml-auto" aria-hidden="true" /></Link>
            <Link href="/analytics" className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"><FiBarChart2 size={19} aria-hidden="true" /> Explore analytics <FiArrowRight className="ml-auto" aria-hidden="true" /></Link>
          </div>
        </section>
      </div>
    </div>
  );
}
