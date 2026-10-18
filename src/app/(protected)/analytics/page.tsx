"use client";

import React from "react";
import Link from "next/link";
import { FiArrowRight, FiBarChart2 } from "react-icons/fi";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import useSWR from "swr";

import SetUpOrg from "@/app/components/SetUpOrg";
import { AnalyticsSkeleton } from "@/app/components/ProtectedPageSkeleton";
import { useOrganization } from "@/app/context/OrganizationContext";
import { fetchAnalyticsData } from "@/app/lib/analytics/api";

const CHART_COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b"];

export default function AnalyticsPage() {
  const { selectedOrg, isLoading } = useOrganization();

  const analyticsKey = selectedOrg
    ? `fetch-analytics-data::${selectedOrg}`
    : null;

  const {
    data,
    error,
    isLoading: isLoadingAnalyticsData,
  } = useSWR(analyticsKey, fetchAnalyticsData, {
    revalidateOnFocus: true,
    dedupingInterval: 60000,
    revalidateOnMount: true,
  });

  const revenueData = data?.data.revenueOverTime ?? [];
  const leadsByStatusData = data?.data.leadsByStatus ?? [];
  const monthlyNewLeadsData = data?.data.monthlyNewLeads ?? [];

  const hasAnalyticsData =
    revenueData.length > 0 ||
    leadsByStatusData.length > 0 ||
    monthlyNewLeadsData.length > 0;

  if (error) return <p role="alert" className="workspace-panel p-6 text-rose-700">Unable to load analytics. Please try again.</p>;

  return (
    <>
      {isLoading ? (
        <AnalyticsSkeleton />
      ) : !selectedOrg ? (
        <SetUpOrg />
      ) : isLoadingAnalyticsData ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          <header className="mb-8">
            <p className="workspace-kicker mb-2">Pipeline / Insights</p>
            <h1 className="workspace-heading">Analytics</h1>
            <p className="workspace-subtitle mt-2">Understand where leads come from and how deals are progressing.</p>
          </header>

          {!hasAnalyticsData ? (
            <div className="workspace-panel flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><FiBarChart2 size={26} aria-hidden="true" /></span>
              <h2 className="mt-5 text-xl font-bold text-slate-900">Insights will grow with your pipeline</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Add leads and deals to start seeing revenue, status, and monthly trends here.</p>
              <Link href="/leads" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">View leads <FiArrowRight aria-hidden="true" /></Link>
            </div>
          ) : <div className="grid gap-6 xl:grid-cols-2">

          {/* Revenue Over Time Chart */}
          {revenueData.length > 0 && <section className="workspace-panel p-6">
            <h2 className="mb-5 text-lg font-bold text-slate-900">Revenue over time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </section>}
          {/* Leads by Status (Pie/Donut Chart) */}
          {leadsByStatusData.length > 0 && <section className="workspace-panel p-6">
            <h2 className="mb-5 text-lg font-bold text-slate-900">Leads by status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leadsByStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {leadsByStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </section>}

          {/* Monthly New Leads (Bar Chart) */}
          {monthlyNewLeadsData.length > 0 && <section className="workspace-panel p-6 xl:col-span-2">
            <h2 className="mb-5 text-lg font-bold text-slate-900">Monthly new leads</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyNewLeadsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="newLeads" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>}
          </div>}
        </>
      )}
    </>
  );
}
