import type { LeadStatus } from "@prisma/client";

const leadStatuses = ["NEW", "CONTACTED", "IN_PROGRESS", "CONVERTED"] as const;

type LeadFields = {
  name: string;
  company: string;
  email: string;
  status: LeadStatus;
};

export function parseLeadFields(input: {
  name: unknown;
  company: unknown;
  email: unknown;
  status: unknown;
}): { ok: true; value: LeadFields } | { ok: false; error: string } {
  const { name, company, email, status } = input;

  if (
    typeof name !== "string" || !name.trim() ||
    typeof company !== "string" || !company.trim() ||
    typeof email !== "string" || !email.trim() ||
    typeof status !== "string"
  ) {
    return { ok: false, error: "Missing or invalid lead fields" };
  }

  const normalizedEmail = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { ok: false, error: "Invalid lead email" };
  }

  const normalizedStatus = status.trim().toUpperCase();
  if (!leadStatuses.includes(normalizedStatus as (typeof leadStatuses)[number])) {
    return { ok: false, error: "Invalid lead status" };
  }

  return {
    ok: true,
    value: {
      name: name.trim(),
      company: company.trim(),
      email: normalizedEmail,
      status: normalizedStatus as LeadStatus,
    },
  };
}
