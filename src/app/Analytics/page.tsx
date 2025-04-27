"use client";

import React, { useState } from "react";

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

import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";

const revenueData = [
  { month: "Jan", year: 2023, revenue: 3000 },
  { month: "Feb", year: 2023, revenue: 3500 },
  { month: "Mar", year: 2023, revenue: 4000 },
  { month: "Apr", year: 2023, revenue: 4500 },
  { month: "May", year: 2023, revenue: 5000 },
  { month: "Jun", year: 2023, revenue: 5500 },
  { month: "Jul", year: 2023, revenue: 6000 },
  { month: "Aug", year: 2023, revenue: 6500 },
  { month: "Sep", year: 2023, revenue: 7000 },
  { month: "Oct", year: 2023, revenue: 7500 },
  { month: "Nov", year: 2023, revenue: 8000 },
  { month: "Dec", year: 2023, revenue: 8500 },
];

const leadsByStatusData = [
  { name: "New", value: 120 },
  { name: "In Progress", value: 80 },
  { name: "Converted", value: 50 },
  { name: "Contacted", value: 30 },
];

const monthlyNewLeadsData = [
  { month: "Jan", newLeads: 30 },
  { month: "Feb", newLeads: 40 },
  { month: "Mar", newLeads: 50 },
  { month: "Apr", newLeads: 60 },
  { month: "May", newLeads: 70 },
  { month: "Jun", newLeads: 80 },
  { month: "Jul", newLeads: 90 },
  { month: "Aug", newLeads: 100 },
  { month: "Sep", newLeads: 110 },
  { month: "Oct", newLeads: 120 },
  { month: "Nov", newLeads: 130 },
  { month: "Dec", newLeads: 140 },
];

export default function AnalyticsPage() {
  const [isOpenSideBar, setIsOpenSideBar] = useState<boolean>(true);
  const toggleSidebar = () => setIsOpenSideBar((prev) => !prev);
  return (
    <div className="min-h-screen flex bg-gray-50">
      <motion.div
        className="bg-gray-800 text-white w-64 h-full fixed top-0 left-0 z-30 transition-all duration-300"
        initial={{ x: -256 }} // Start hidden on the left
        animate={{ x: isOpenSideBar ? 0 : -256 }} // Slide in/out based on isOpen state
        exit={{ x: -256 }} // Same for exit animation
        transition={{ duration: 0.01 }} // Smooth transition settings
      >
        <Sidebar toggleSideBar={toggleSidebar} />
      </motion.div>

      <motion.main
        className="flex flex-col w-full p-8"
        animate={{ marginLeft: isOpenSideBar ? "16rem" : "0" }} // smooth transition of margin-left (lg:ml-64)
        transition={{ duration: 0.2 }} // Set transition duration for smooth effect
      >
        <div className="ml-10">
          <h2 className="text-3xl font-semibold mb-6">Analytics</h2>
        </div>

        {/* Revenue Over Time Chart */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              {/* XAxis updated to safely handle both month and year */}
              <XAxis
                dataKey="month"
                tickFormatter={(tick, index) => {
                  const year = revenueData[index]?.year;
                  return year ? `${tick} ${year}` : tick; // safely concatenate the month and year
                }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
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
                    fill={["#0088FE", "#00C49F", "#FFBB28", "#FF8042"][index]}
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
              <Bar dataKey="newLeads" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
