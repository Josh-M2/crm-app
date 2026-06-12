"use client";

import { Card } from "@heroui/react";
import { motion } from "framer-motion";
import SetUpOrg from "@/app/components/SetUpOrg";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useOrganization } from "@/app/context/OrganizationContext";
import useSWR from "swr";

import { fetchDashboardData } from "@/app/lib/dashboard/api";
import {
  formatStatsFromApi,
  formatActivitiesFromApi,
} from "@/app/lib/dashboard/helpers";
import { DashboardSkeleton } from "@/app/components/ProtectedPageSkeleton";

import { StatsTypes, ActivityTypes } from "@/app/types/dashboard";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { selectedOrg } = useOrganization();
  const [initDashboardData, setInitDashboardData] = useState<StatsTypes[]>();
  const [initDashboardActivity, setInitDashboardActivity] =
    useState<ActivityTypes[]>();

  const dashboardKey = selectedOrg ? `fetch-dashboard-data::${selectedOrg}` : null;

  const {
    data,
    error,
    isLoading: isLoadingDashboardData,
  } = useSWR(dashboardKey, fetchDashboardData, {
    revalidateOnFocus: true,
    dedupingInterval: 60000,
    revalidateOnMount: true,
    onError: (err) => console.error("Error fetching dashboard data:", err),
  });

  useEffect(() => {
    if (data) {
      const stats = formatStatsFromApi(data);
      const activity = formatActivitiesFromApi(data);
      setInitDashboardData(stats);
      setInitDashboardActivity(activity);
    }
  }, [data]);

  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      {!session || !session.user?.email || isLoadingDashboardData ? (
          <DashboardSkeleton />
        ) : selectedOrg && !isLoadingDashboardData && initDashboardData ? (
          <>
            <div className="place-items-center">
              <h2 className="text-3xl font-bold mb-2">
                Hi, {session?.user?.name} 👋
              </h2>
              <p className="text-gray-600 mb-8">
                Here&apos;s what&apos;s happening with your leads today.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {initDashboardData &&
                initDashboardData.map(
                  // to make types
                  (stat: StatsTypes, index: number) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.03 }}
                      className="bg-white rounded-xl shadow p-6 text-center"
                    >
                      <h3 className="text-xl font-semibold">{stat.value}</h3>
                      <p className="text-gray-500">{stat.title}</p>
                    </motion.div>
                  )
                )}
            </div>

            {/* Recent Activity */}
            <Card className="bg-white shadow p-6">
              <h3 className="text-2xl font-semibold mb-4">Recent Activity</h3>
              <ul className="space-y-4">
                {initDashboardActivity &&
                  initDashboardActivity.map((activity: ActivityTypes) => (
                    <li key={activity.id} className="text-gray-700">
                      {/* add madakinf more hera! */}
                      <span className="font-medium">
                        {activity.description}
                      </span>
                      <div className="text-sm text-gray-400">
                        {activity.timeAgo}
                      </div>
                    </li>
                  ))}
              </ul>
            </Card>
          </>
        ) : (
          <SetUpOrg />
        )}
    </>
  );
}
