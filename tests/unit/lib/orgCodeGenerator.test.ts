import { describe, expect, it } from "vitest";
import { generateUniqueName } from "@/app/lib/orgCodeGenerator";

describe("generateUniqueName", () => {
  it("normalizes organization names and appends a uuid", () => {
    const code = generateUniqueName("Acme Sales Team!");

    expect(code).toMatch(
      /^acme_sales_team_+[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it("generates different codes for the same organization name", () => {
    const firstCode = generateUniqueName("Acme");
    const secondCode = generateUniqueName("Acme");

    expect(firstCode).not.toBe(secondCode);
  });
});
