"use client";

import React, { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/app/components/Sidebar";
import { usePathname } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";

const expandedWidth = "16rem";
const collapsedWidth = "5rem";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const mainStyle = {
    "--sidebar-offset": isCollapsed ? collapsedWidth : expandedWidth,
  } as CSSProperties;

  return (
    <div className="min-h-screen bg-gray-50">
      <button
        type="button"
        aria-label={isMobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isMobileOpen}
        className="fixed left-4 top-4 z-40 rounded-lg border border-gray-200 bg-white p-3 text-gray-900 shadow md:hidden"
        onClick={() => setIsMobileOpen((open) => !open)}
      >
        {isMobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {isMobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 shadow-xl md:hidden">
            <Sidebar
              isCollapsed={false}
              isPinnedOpen
              toggleSideBar={() => setIsMobileOpen(false)}
              toggleLabel="Close navigation"
            />
          </div>
        </>
      )}

      <motion.div
        className="fixed left-0 top-0 z-30 hidden h-screen overflow-hidden border-r border-gray-200 bg-white text-gray-900 shadow-sm md:block"
        initial={{ x: -256 }}
        animate={{ x: 0, width: isCollapsed ? collapsedWidth : expandedWidth }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          isPinnedOpen={!isCollapsed}
          toggleSideBar={() => setIsCollapsed((prev) => !prev)}
        />
      </motion.div>

      <main
        className="flex min-h-screen flex-col overflow-x-hidden px-4 pb-8 pt-20 transition-[margin-left] duration-200 ease-out md:ml-[var(--sidebar-offset)] md:p-8"
        style={mainStyle}
      >
        {children}
      </main>
    </div>
  );
}
