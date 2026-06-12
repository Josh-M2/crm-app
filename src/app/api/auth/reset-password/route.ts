import bcrypt from "bcrypt";
import crypto from "crypto";
import prismaInstance from "@/app/lib/prismaInstance";
import { NextRequest, NextResponse } from "next/server";

type PasswordResetUser = {
  id: string;
  password: string;
};

const getTokenHash = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

const findUserByResetToken = async (token: string) => {
  const tokenHash = getTokenHash(token);
  const users = await prismaInstance.$queryRaw<PasswordResetUser[]>`
    SELECT "id", "password"
    FROM "User"
    WHERE "passwordResetTokenHash" = ${tokenHash}
      AND "passwordResetExpiresAt" > NOW()
    LIMIT 1
  `;

  return users[0] ?? null;
};

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Reset token is required" }, { status: 400 });
  }

  const user = await findUserByResetToken(token);

  if (!user) {
    return NextResponse.json(
      { error: "Reset link is invalid or expired" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const { token, password, repeatPassword } = await req.json();

  if (!token || !password || !repeatPassword) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (password.length < 12) {
    return NextResponse.json(
      { error: "Password must be at least 12 characters" },
      { status: 400 }
    );
  }

  if (password !== repeatPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  }

  const user = await findUserByResetToken(token);

  if (!user) {
    return NextResponse.json(
      { error: "Reset link is invalid or expired" },
      { status: 400 }
    );
  }

  const isSamePassword = await bcrypt.compare(password, user.password);

  if (isSamePassword) {
    return NextResponse.json(
      { error: "New password must be different from current password" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prismaInstance.$executeRaw`
    UPDATE "User"
    SET "password" = ${hashedPassword},
        "passwordResetTokenHash" = NULL,
        "passwordResetExpiresAt" = NULL,
        "updatedAt" = NOW()
    WHERE "id" = ${user.id}
  `;

  return NextResponse.json({ success: true }, { status: 200 });
}
