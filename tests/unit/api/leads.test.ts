// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getOrgMembership: vi.fn(),
  isOrgUser: vi.fn(),
  requireOrgRole: vi.fn(),
  findCategory: vi.fn(),
  findLeads: vi.fn(),
  countLeads: vi.fn(),
  deleteCategory: vi.fn(),
  createCategory: vi.fn(),
  createActivity: vi.fn(),
}));

vi.mock("@/app/lib/routeAuth", () => ({
  getOrgMembership: mocks.getOrgMembership,
  isOrgUser: mocks.isOrgUser,
  requireOrgRole: mocks.requireOrgRole,
}));

vi.mock("@/app/lib/prismaInstance", () => ({
  default: {
    leadCategory: {
      findFirst: mocks.findCategory,
      deleteMany: mocks.deleteCategory,
      create: mocks.createCategory,
    },
    lead: {
      findMany: mocks.findLeads,
      count: mocks.countLeads,
    },
    activity: { create: mocks.createActivity },
  },
}));

import { GET as fetchLeadList } from "@/app/api/leads/manage-lead-list/fetch-lead-list/route";
import { POST as deleteLeadList } from "@/app/api/leads/manage-lead-category/delete-categorized-lead/route";
import { POST as addLead } from "@/app/api/leads/manage-lead-list/add-lead-item/route";
import { POST as addLeadList } from "@/app/api/leads/manage-lead-category/add-categorized-lead/route";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getOrgMembership.mockResolvedValue({
    user: { id: "user-1" },
    membership: { role: "ADMIN" },
  });
  mocks.requireOrgRole.mockReturnValue(null);
});

describe("lead list routes", () => {
  it("gets the list name from the database for direct links", async () => {
    mocks.findCategory.mockResolvedValue({ name: "Prospects" });
    mocks.findLeads.mockResolvedValue([]);

    const response = await fetchLeadList(
      new NextRequest("http://localhost/api/leads?selectedOrg=org-1&catId=list-1"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      categoryName: "Prospects",
      leadList: [],
    });
    expect(mocks.findCategory).toHaveBeenCalledWith({
      where: { id: "list-1", organizationId: "org-1" },
      select: { name: true },
    });
  });

  it("rejects an unknown list instead of returning an empty list", async () => {
    mocks.findCategory.mockResolvedValue(null);

    const response = await fetchLeadList(
      new NextRequest("http://localhost/api/leads?selectedOrg=org-1&catId=missing"),
    );

    expect(response.status).toBe(404);
    expect(mocks.findLeads).not.toHaveBeenCalled();
  });

  it("protects leads from becoming orphaned when a list is deleted", async () => {
    mocks.findCategory.mockResolvedValue({ name: "Prospects" });
    mocks.countLeads.mockResolvedValue(2);

    const response = await deleteLeadList(
      new NextRequest("http://localhost/api/leads", {
        method: "POST",
        body: JSON.stringify({ id: "list-1", selectedOrg: "org-1" }),
      }),
    );

    expect(response.status).toBe(409);
    expect(mocks.deleteCategory).not.toHaveBeenCalled();
  });

  it("rejects malformed lead status before writing to the database", async () => {
    const response = await addLead(
      new NextRequest("http://localhost/api/leads", {
        method: "POST",
        body: JSON.stringify({
          name: "Jane Doe",
          company: "Example",
          leadEmail: "jane@example.com",
          status: "unknown",
          organizationId: "org-1",
          categoryId: "list-1",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid lead status" });
    expect(mocks.getOrgMembership).not.toHaveBeenCalled();
  });

  it("rejects a blank lead list name before writing to the database", async () => {
    const response = await addLeadList(
      new NextRequest("http://localhost/api/leads", {
        method: "POST",
        body: JSON.stringify({
          categoryName: "  ",
          selectedOrg: "org-1",
          ownerId: "user-1",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.getOrgMembership).not.toHaveBeenCalled();
  });

  it("uses an organization member ID for a new list assignee", async () => {
    mocks.isOrgUser.mockResolvedValue(true);
    mocks.createCategory.mockResolvedValue({ id: "list-1", name: "Prospects" });
    mocks.createActivity.mockResolvedValue({ id: "activity-1" });

    const response = await addLeadList(
      new NextRequest("http://localhost/api/leads", {
        method: "POST",
        body: JSON.stringify({
          categoryName: "Prospects",
          selectedOrg: "org-1",
          ownerId: "user-1",
          assignedUserId: "user-2",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.isOrgUser).toHaveBeenCalledWith("user-2", "org-1");
    expect(mocks.createCategory).toHaveBeenCalledWith({
      data: {
        name: "Prospects",
        ownerId: "user-1",
        assignedToId: "user-2",
        organizationId: "org-1",
      },
    });
  });
});
