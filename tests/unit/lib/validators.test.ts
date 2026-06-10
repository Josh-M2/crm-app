import { describe, expect, it } from "vitest";
import {
  validateEmail,
  validateName,
  validatePassword,
  validateRepeatPassword,
} from "@/app/lib/validators";

describe("validators", () => {
  it("validates names", () => {
    expect(validateName("Jane Doe")).toBeNull();
    expect(validateName("")).toBe("Name is required");
    expect(validateName("J")).toBe("Invalid name");
    expect(validateName("Jane123")).toBe("Invalid name");
  });

  it("validates email addresses", () => {
    expect(validateEmail("jane@example.com")).toBeNull();
    expect(validateEmail("")).toBe("Email address is required");
    expect(validateEmail("not-an-email")).toBe("Invalid email address");
  });

  it("validates passwords by form context", () => {
    expect(validatePassword("short", "login")).toBeNull();
    expect(validatePassword("", "login")).toBe("Password is required");
    expect(validatePassword("short", "signup")).toBe(
      "Password must be at least 12 characters"
    );
  });

  it("validates repeated passwords", () => {
    expect(validateRepeatPassword("same-password", "same-password")).toBeNull();
    expect(validateRepeatPassword("", "same-password")).toBe(
      "Password is required"
    );
    expect(validateRepeatPassword("one", "two")).toBe("Passwords do not match");
  });
});
