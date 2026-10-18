import React, { type HTMLAttributes, type ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProtectedLayout from "@/app/(protected)/layout";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      animate,
      children,
      className,
    }: HTMLAttributes<HTMLDivElement> & {
      animate: { width: string };
    }) => <div data-width={animate.width} className={className}>{children}</div>,
  },
}));

vi.mock("@/app/components/Sidebar", () => ({
  default: ({
    isCollapsed,
    toggleSideBar,
    toggleLabel,
  }: {
    isCollapsed: boolean;
    toggleSideBar: () => void;
    toggleLabel?: string;
  }) => (
    <button
      type="button"
      aria-label={toggleLabel ?? (isCollapsed ? "Expand sidebar" : "Collapse sidebar")}
      onClick={toggleSideBar}
    >
      {isCollapsed ? "Collapsed" : "Expanded"}
    </button>
  ),
}));

const renderLayout = (children: ReactNode = "Page content") =>
  render(<ProtectedLayout>{children}</ProtectedLayout>);

describe("ProtectedLayout navigation", () => {
  it("stays collapsed after the pointer moves over the sidebar", () => {
    renderLayout();
    const sidebar = screen.getByText("Expanded").parentElement;
    expect(sidebar).toHaveAttribute("data-width", "16rem");

    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(sidebar).toHaveAttribute("data-width", "5rem");
    fireEvent.mouseEnter(sidebar as HTMLElement);
    expect(sidebar).toHaveAttribute("data-width", "5rem");
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeVisible();
  });

  it("opens and closes navigation on small screens", () => {
    renderLayout();
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(screen.getAllByRole("button", { name: "Close navigation" })).toHaveLength(3);
    fireEvent.click(screen.getAllByRole("button", { name: "Close navigation" })[2]);
    expect(screen.getByRole("button", { name: "Open navigation" })).toBeVisible();
  });
});
