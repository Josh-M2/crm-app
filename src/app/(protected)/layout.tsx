"use client";

import { type CSSProperties, type ReactNode, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/app/components/Sidebar";

const expandedWidth = "16rem";
const collapsedWidth = "5rem";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const isSidebarExpanded = !isCollapsed || isHovering;
  const mainStyle = {
    "--sidebar-offset": isCollapsed ? collapsedWidth : expandedWidth,
  } as CSSProperties;

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        className="fixed left-0 top-0 z-30 hidden h-screen overflow-hidden border-r border-gray-200 bg-white text-gray-900 shadow-sm md:block"
        initial={{ x: -256 }}
        animate={{ x: 0, width: isSidebarExpanded ? expandedWidth : collapsedWidth }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Sidebar
          isCollapsed={!isSidebarExpanded}
          isPinnedOpen={!isCollapsed}
          toggleSideBar={() => setIsCollapsed((prev) => !prev)}
        />
      </motion.div>

      <main
        className="flex min-h-screen flex-col overflow-x-hidden p-8 transition-[margin-left] duration-200 ease-out md:ml-[var(--sidebar-offset)]"
        style={mainStyle}
      >
        {children}
      </main>
    </div>
  );
}
