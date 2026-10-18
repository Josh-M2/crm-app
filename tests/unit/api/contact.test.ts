// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getSmtpConfig: vi.fn(),
  sendMail: vi.fn(),
}));

vi.mock("@/app/lib/smtp", () => ({
  getSmtpConfig: mocks.getSmtpConfig,
  sendMail: mocks.sendMail,
}));

import { POST } from "@/app/api/contact/route";

const request = (body: object) => new NextRequest("http://localhost/api/contact", {
  method: "POST",
  body: JSON.stringify(body),
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSmtpConfig.mockReturnValue({ user: "inbox@example.com" });
  mocks.sendMail.mockResolvedValue(undefined);
});

describe("contact route", () => {
  it("rejects invalid content without sending mail", async () => {
    const response = await POST(request({ name: "A", email: "wrong", message: "short" }));
    expect(response.status).toBe(400);
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });

  it("ignores honeypot submissions", async () => {
    const response = await POST(request({ website: "spam.example" }));
    expect(response.status).toBe(200);
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });

  it("escapes message content in the email", async () => {
    const response = await POST(request({ name: "Jane Doe", email: "jane@example.com", message: "Please connect <script> data." }));
    expect(response.status).toBe(200);
    expect(mocks.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: "inbox@example.com",
      html: expect.stringContaining("&lt;script&gt;"),
    }));
  });
});
