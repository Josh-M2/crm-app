import { describe, expect, it } from "vitest";
import { parseLeadFields } from "@/app/lib/leads/validation";

const validInput = {
  name: " Jane Doe ",
  company: " Example, Inc. ",
  email: " jane@example.com ",
  status: "in_progress",
};

describe("parseLeadFields", () => {
  it("normalizes valid lead data", () => {
    expect(parseLeadFields(validInput)).toEqual({
      ok: true,
      value: {
        name: "Jane Doe",
        company: "Example, Inc.",
        email: "jane@example.com",
        status: "IN_PROGRESS",
      },
    });
  });

  it("rejects invalid status before it reaches Prisma", () => {
    expect(parseLeadFields({ ...validInput, status: "closed" })).toEqual({
      ok: false,
      error: "Invalid lead status",
    });
  });

  it("rejects blank fields and malformed email", () => {
    expect(parseLeadFields({ ...validInput, name: "  " }).ok).toBe(false);
    expect(parseLeadFields({ ...validInput, email: "bad-email" })).toEqual({
      ok: false,
      error: "Invalid lead email",
    });
  });
});
