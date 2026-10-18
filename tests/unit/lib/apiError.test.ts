import axios from "axios";
import { describe, expect, it } from "vitest";
import { getApiErrorMessage } from "@/app/lib/apiError";

describe("getApiErrorMessage", () => {
  it("shows an API error when available", () => {
    const error = new axios.AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
      data: { error: "Delete the leads in this list first" },
      status: 409,
    } as never);

    expect(getApiErrorMessage(error, "Try again")).toBe(
      "Delete the leads in this list first",
    );
  });

  it("uses a safe fallback for unknown errors", () => {
    expect(getApiErrorMessage(new Error("internal detail"), "Try again")).toBe(
      "Try again",
    );
  });
});
