import { describe, expect, it } from "vitest";
import {
  capitalizeStatus,
  dealsDataFormatter,
  filterOrgUsersData,
} from "@/app/lib/deals/helpers";
import type { FilterOrgUsersDataTypes, RawDeal } from "@/app/types/deals";

describe("deal helpers", () => {
  it("capitalizes status text", () => {
    expect(capitalizeStatus("pending")).toBe("Pending");
    expect(capitalizeStatus("WON")).toBe("Won");
  });

  it("formats raw deals for the deals table", () => {
    const rawDeals = [
      {
        id: "deal-1",
        name: "Enterprise plan",
        amount: "12500.50",
        status: "WON",
        owner: { id: "user-1", name: "Jane" },
        updatedAt: new Date("2026-06-10T08:30:00.000Z"),
      },
      {
        id: "deal-2",
        name: "Renewal",
        amount: "not-a-number",
        status: "PENDING",
        owner: { id: "user-2", name: null },
        updatedAt: new Date("2026-06-09T10:00:00.000Z"),
      },
    ] satisfies RawDeal[];

    expect(dealsDataFormatter(rawDeals)).toEqual([
      {
        id: "deal-1",
        name: "Enterprise plan",
        amount: 12500.5,
        status: "won",
        owner: "Jane",
        ownerId: "user-1",
        lastInteraction: "2026-06-10",
      },
      {
        id: "deal-2",
        name: "Renewal",
        amount: 0,
        status: "pending",
        owner: "Unknown",
        ownerId: "user-2",
        lastInteraction: "2026-06-09",
      },
    ]);
  });

  it("splits organization users into agent and miner lists", () => {
    const orgUsers = [
      { role: "AGENT", user: { id: "agent-1", name: "Ava" } },
      { role: "MINER", user: { id: "miner-1", name: null } },
      { role: "ADMIN", user: { id: "admin-1", name: "Admin" } },
    ] satisfies FilterOrgUsersDataTypes[];

    expect(filterOrgUsersData(orgUsers)).toEqual({
      agentList: [{ id: "agent-1", name: "Ava" }],
      minerList: [{ id: "miner-1", name: "Unknown user" }],
    });
  });
});
