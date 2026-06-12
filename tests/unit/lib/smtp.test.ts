import { afterEach, describe, expect, it } from "vitest";
import { buildResetEmail, getSmtpConfig } from "@/app/lib/smtp";

const originalEnv = { ...process.env };

describe("smtp helpers", () => {
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns null when SMTP configuration is incomplete", () => {
    delete process.env.SMTP_HOST;
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "mailer@example.com";
    process.env.SMTP_PASSWORD = "secret";

    expect(getSmtpConfig()).toBeNull();
  });

  it("reads SMTP configuration from the environment", () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "mailer@example.com";
    process.env.SMTP_PASSWORD = "secret";

    expect(getSmtpConfig()).toEqual({
      host: "smtp.example.com",
      port: 587,
      user: "mailer@example.com",
      password: "secret",
    });
  });

  it("builds reset password email content and escapes the HTML link", () => {
    const resetUrl = 'https://leadnest.test/reset-password?token=<bad>&next="x"';

    const email = buildResetEmail(resetUrl);

    expect(email.subject).toBe("Reset your LeadNest password");
    expect(email.text).toContain(resetUrl);
    expect(email.html).toContain(
      "https://leadnest.test/reset-password?token=&lt;bad&gt;&amp;next=&quot;x&quot;"
    );
    expect(email.html).not.toContain(resetUrl);
  });
});
