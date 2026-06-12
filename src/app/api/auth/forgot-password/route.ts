import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prismaInstance from "@/app/lib/prismaInstance";
import { buildResetEmail, getSmtpConfig, sendMail } from "@/app/lib/smtp";

const RESET_TOKEN_EXPIRY_MINUTES = 30;

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const smtpConfig = getSmtpConfig();

  if (!smtpConfig || !appUrl) {
    return NextResponse.json(
      { error: "Password reset is not configured" },
      { status: 501 },
    );
  }

  const user = await prismaInstance.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

  await prismaInstance.$executeRaw`
    UPDATE "User"
    SET "passwordResetTokenHash" = ${tokenHash},
        "passwordResetExpiresAt" = ${expiresAt},
        "updatedAt" = NOW()
    WHERE "id" = ${user.id}
  `;

  const resetUrl = new URL("/reset-password", appUrl);
  resetUrl.searchParams.set("token", token);

  const emailContent = buildResetEmail(resetUrl.toString());

  try {
    await sendMail({
      to: user.email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });
  } catch (error) {
    await prismaInstance.$executeRaw`
      UPDATE "User"
      SET "passwordResetTokenHash" = NULL,
          "passwordResetExpiresAt" = NULL,
          "updatedAt" = NOW()
      WHERE "id" = ${user.id}
    `;

    console.error("Forgot password email error:", error);
    return NextResponse.json(
      { error: "Unable to send reset email" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
