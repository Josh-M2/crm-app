// app/dashboard/page.tsx
"use client";

import { Card, Button } from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axiosInstance";
import SetUpOrg from "@/components/SetUpOrg";

const stats = [
  { title: "Total Leads", value: "1,200" },
  { title: "Active Deals", value: "320" },
  { title: "Conversion Rate", value: "27%" },
  { title: "Revenue", value: "$85,400" },
];

const activities = [
  { id: 1, description: "New lead added: John Doe", time: "2 hours ago" },
  { id: 2, description: "Deal closed: ACME Corp", time: "5 hours ago" },
  { id: 3, description: "Lead updated: Jane Smith", time: "1 day ago" },
  { id: 4, description: "New lead added: John Doe", time: "2 hours ago" },
  { id: 5, description: "Deal closed: ACME Corp", time: "5 hours ago" },
  { id: 6, description: "Lead updated: Jane Smith", time: "1 day ago" },
  { id: 7, description: "Deal closed: ACME Corp", time: "5 hours ago" },
  { id: 8, description: "Lead updated: Jane Smith", time: "1 day ago" },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();

  //use the loader state when integrating skeloton loaders!
  const [initDashboardDataLoading, setInitDasboardDataLoading] =
    useState<boolean>(true);

  //to add types
  const [initDashboardData, setInitDasboardData] = useState<any>(null);

  const [isOpenSideBar, setIsOpenSideBar] = useState<boolean>(true);

  const toggleSidebar = () => setIsOpenSideBar((prev) => !prev);

  useEffect(() => {
    console.log("session: ", session);
    console.log("status: ", status);
  }, [session, status]);

  useEffect(() => {
    const initDashboardData = async () => {
      setInitDasboardDataLoading(true);

      try {
        const response = await axiosInstance.get("/dashboard/init-dashboard", {
          params: {
            email: session?.user?.email,
          },
        });

        if (response?.data.error) {
          console.log("errors shit");
          switch (response.data.error.status) {
            case 204:
              console.log("dashboard initData: 204", response.data.error);
              break;
            case 401:
              console.log("dashboard initData: 401", response.data.error);
              break;
            case 400:
              console.log("dashboard initData: 400", response.data.error);
              break;
            default:
              break;
          }
          return;
        }

        if (response?.data) {
          console.log("w3wdasd", response.data);
          setInitDasboardData(response.data);
        }
      } catch (error) {
        console.error("error fetching dashboard datas:", error);
      }

      setInitDasboardDataLoading(false);
    };

    if (session && typeof window !== "undefined") {
      const fetched = localStorage.getItem("dashboardDataFetched");

      if (!fetched) {
        localStorage.setItem("dashboardDataFetched", "true");
        initDashboardData();
      }
    }
  }, [session]);

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
        {initDashboardDataLoading ? (
          "" //loadershit here
        ) : initDashboardData ? (
          <>
            <div className="place-items-center">
              <h2 className="text-3xl font-bold mb-2">Hi, John 👋</h2>
              <p className="text-gray-600 mb-8">
                Here's what's happening with your leads today.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white rounded-xl shadow p-6 text-center"
                >
                  <h3 className="text-xl font-semibold">{stat.value}</h3>
                  <p className="text-gray-500">{stat.title}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <Card className="bg-white shadow p-6">
              <h3 className="text-2xl font-semibold mb-4">Recent Activity</h3>
              <ul className="space-y-4">
                {activities.map((activity) => (
                  <li key={activity.id} className="text-gray-700">
                    <span className="font-medium">{activity.description}</span>
                    <div className="text-sm text-gray-400">{activity.time}</div>
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
