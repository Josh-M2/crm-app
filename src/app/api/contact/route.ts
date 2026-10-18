import { NextRequest, NextResponse } from "next/server";
import { getSmtpConfig, sendMail } from "@/app/lib/smtp";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const fields = body as Record<string, unknown>;
  if (typeof fields.website === "string" && fields.website.trim()) {
    return NextResponse.json({ success: true });
  }

  const name = typeof fields.name === "string" ? fields.name.trim() : "";
  const email = typeof fields.email === "string" ? fields.email.trim() : "";
  const message = typeof fields.message === "string" ? fields.message.trim() : "";

  if (name.length < 2 || name.length > 100 || !emailPattern.test(email) || email.length > 254 || message.length < 10 || message.length > 5000) {
    return NextResponse.json({ error: "Enter a valid name, email, and message (10–5000 characters)." }, { status: 400 });
  }

  const smtp = getSmtpConfig();
  const recipient = process.env.CONTACT_EMAIL?.trim() || smtp?.user;
  if (!smtp || !recipient) {
    return NextResponse.json({ error: "Contact is temporarily unavailable." }, { status: 503 });
  }

  try {
    await sendMail({
      to: recipient,
      subject: `LeadNest contact from ${name.replace(/[\r\n]/g, " ")}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact email error:", error);
    return NextResponse.json({ error: "Unable to send your message. Please try again later." }, { status: 500 });
  }
}
