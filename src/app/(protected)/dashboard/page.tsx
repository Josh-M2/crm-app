"use client";

import { Card, Button } from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axiosInstance";
import SetUpOrg from "@/app/components/SetUpOrg";
import useSWR from "swr";
import { useOrganization } from "@/app/context/OrganizationContext";
import { formatDistanceToNow } from "date-fns";

function formatStatsFromApi(data: {
  leadCount: number;
  activeDeals: number;
  conversionRate: number;
  revenue: number;
}) {
  return [
    { title: "Total Leads", value: data.leadCount.toString() },
    { title: "Active Deals", value: data.activeDeals.toString() },
    { title: "Conversion Rate", value: `${data.conversionRate}%` },
    { title: "Revenue", value: `$${Number(data.revenue).toLocaleString()}` },
  ];
}

type Activity = {
  id: string;
  description: string;
  user: {
    name: string;
  };
  timeAgo: string; // "less than a minute ago"
};

function formatActivitiesFromApi(activities: Activity[]) {
  return activities.map((activity) => ({
    id: activity.id,
    description: activity.description,
    userName: activity.user.name,
    timeAgo: activity.timeAgo,
  }));
}

//to make type
const fetchDashboardData = async (refData: any) => {
  console.log("dashbcoasrddsd: ", refData);
  const [message, email, selectedOrg] = refData.split("::");
  const response = await axiosInstance.get("/dashboard/init-dashboard", {
    params: {
      email: email,
      selectedOrg: selectedOrg,
    },
  });

  console.log("fetchDashboardData: ", response);

  if (response?.data.error) {
    throw new Error(`Error: ${response.data.error.status}`);
  }

  return response?.data;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { selectedOrg } = useOrganization();
  useEffect(() => {
    if (selectedOrg) console.log("selectedOrgDashboard: ", selectedOrg);
  }, [selectedOrg]);

  //to add types
  const [initDashboardData, setInitDasboardData] = useState<any>(null);
  const [initDashboardActivity, setInitDasboardActivity] = useState<any>(null);

  const [isOpenSideBar, setIsOpenSideBar] = useState<boolean>(true);

  const toggleSidebar = () => setIsOpenSideBar((prev) => !prev);

  useEffect(() => {
    console.log("session: ", session);
    console.log("status: ", status);
  }, [session, status]);

  const dashboardKey =
    session?.user?.email && selectedOrg
      ? `fetch-dashboard-data::${session.user.email}::${selectedOrg}`
      : null;

  const {
    data,
    error,
    isLoading: isLoadingDashboardData,
    mutate,
  } = useSWR(dashboardKey, fetchDashboardData, {
    revalidateOnFocus: true, // automatically revalidate on window/tab focus
    dedupingInterval: 60000, // dedupe requests within 1 minute
    // refreshInterval: 5000, // optional: refresh every 5 seconds for live updates
    revalidateOnMount: true,

    onError: (err) => {
      console.error("Error fetching dashboard data:", err);
    },
  });

  useEffect(() => {
    if (data) {
      console.log("data daashboard: ", data.data);
      const stats = formatStatsFromApi(data.data);
      const activity = formatActivitiesFromApi(data.data.activitiesWithTimeAgo);
      setInitDasboardActivity(activity);
      setInitDasboardData(stats);
    }
  }, [data]);

  // if (!session || !session.user?.email || isLoading) {
  //   return <p>Loading...</p>; // Or any other appropriate fallback UI
  // }

  // Handle error states
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <motion.div
        className="bg-gray-800 text-white w-64 h-full fixed top-0 left-0 z-30 transition-all duration-300"
        initial={{ x: -256 }} // Start hidden on the left
        animate={{ x: isOpenSideBar ? 0 : -256 }} // Slide in/out based on isOpenSideBar state
        exit={{ x: -256 }} // Same for exit animation
        transition={{ duration: 0.01 }} // Smooth transition settings
      >
        <Sidebar toggleSideBar={toggleSidebar} />
      </motion.div>

      {/* Main Content */}
      <motion.main
        className="flex flex-col w-full p-8"
        animate={{ marginLeft: isOpenSideBar ? "16rem" : "0" }} // smooth transition of margin-left (lg:ml-64)
        transition={{ duration: 0.2 }} // Set transition duration for smooth effect
      >
        {!session || !session.user?.email || isLoadingDashboardData ? (
          "" //loadershit here
        ) : selectedOrg && !isLoadingDashboardData && initDashboardData ? (
          <>
            <div className="place-items-center">
              <h2 className="text-3xl font-bold mb-2">
                Hi, {session?.user?.name} 👋
              </h2>
              <p className="text-gray-600 mb-8">
                Here's what's happening with your leads today.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {initDashboardData.map(
                // to make types
                (stat: any, index: number) => (
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
                {initDashboardActivity.map((activity: any) => (
                  <li key={activity.id} className="text-gray-700">
                    {/* add madakinf more hera! */}
                    <span className="font-medium">{activity.description}</span>
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
      </motion.main>
      <button
        onClick={toggleSidebar}
        className={`absolute top-4 left-4 bg-transparent hover:bg-gray-300 py-2 px-4 rounded-md z-10 ${
          isOpenSideBar ? "hidden" : ""
        }`}
      >
        =
      </button>
    </div>
  );
}
