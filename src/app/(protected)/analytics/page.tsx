"use client";

import React from "react";

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

const CHART_COLORS = ["#2563eb", "#059669", "#d97706", "#dc2626"];

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

  if (error) return <p>Error: {error.message}</p>;

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
            <div className="ml-10">
              <h2 className="text-3xl font-semibold mb-6">Analytics</h2>
            </div>

            {!hasAnalyticsData && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-600">
                No analytics data yet.
              </div>
            )}

            {/* Revenue Over Time Chart */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Revenue Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#2563eb" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Leads by Status (Pie/Donut Chart) */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Leads by Status</h3>
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
            </div>

            {/* Monthly New Leads (Bar Chart) */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Monthly New Leads</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyNewLeadsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="newLeads" fill="#059669" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
    </>
  );
}
