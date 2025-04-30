// app/dashboard/page.tsx
"use client";

import { Card, Button } from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
  const [isOpenSideBar, setIsOpenSideBar] = useState<boolean>(true);
  const toggleSidebar = () => setIsOpenSideBar((prev) => !prev);
  // const { data: session, status } = useSession();

  // useEffect(() => {
  //   console.log("session: ", session);
  //   console.log("status: ", status);
  // }, [session, status]);

  // const handleNavClick = () => {
  //   if (pathname) {
  //     setActiveSection(pathname);
  //   }
  // };

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
