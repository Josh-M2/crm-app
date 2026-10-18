"use client";

import React, { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/app/components/Sidebar";
import { usePathname } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";

const expandedWidth = "17rem";
const collapsedWidth = "5.5rem";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    setIsCollapsed(localStorage.getItem("leadnest-sidebar-collapsed") === "true");
  }, []);

  const toggleDesktopSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("leadnest-sidebar-collapsed", String(next));
  };

  const mainStyle = {
    "--sidebar-offset": isCollapsed ? collapsedWidth : expandedWidth,
  } as CSSProperties;

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <button
        type="button"
        aria-label={isMobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isMobileOpen}
        className="fixed left-4 top-4 z-40 rounded-xl border border-slate-200 bg-white p-3 text-slate-900 shadow-lg md:hidden"
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
          <div className="fixed inset-y-0 left-0 z-50 w-[17rem] shadow-xl md:hidden">
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
        className="fixed left-0 top-0 z-30 hidden h-screen overflow-hidden border-r border-slate-200 bg-white text-slate-900 md:block"
        initial={false}
        animate={{ width: isCollapsed ? collapsedWidth : expandedWidth }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          isPinnedOpen={!isCollapsed}
          toggleSideBar={toggleDesktopSidebar}
        />
      </motion.div>

      <main
        className="min-h-screen overflow-x-hidden px-4 pb-10 pt-20 transition-[margin-left] duration-200 ease-out sm:px-6 md:ml-[var(--sidebar-offset)] md:px-8 md:pt-10 lg:px-10"
        style={mainStyle}
      >
        <div className="mx-auto w-full max-w-[1440px]">{children}</div>
      </main>
    </div>
  );
}
