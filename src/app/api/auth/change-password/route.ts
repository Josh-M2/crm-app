import bcrypt from "bcrypt";
import prismaInstance from "@/app/lib/prismaInstance";
import { getCurrentUser } from "@/app/lib/routeAuth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const auth = await getCurrentUser(req);

  if ("response" in auth) return auth.response;

  const { currentPassword, newPassword, repeatNewPassword } = await req.json();

  if (!currentPassword || !newPassword || !repeatNewPassword) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (newPassword.length < 12) {
    return NextResponse.json(
      { error: "New password must be at least 12 characters" },
      { status: 400 },
    );
  }

  if (newPassword !== repeatNewPassword) {
    return NextResponse.json({ error: "New passwords do not match" }, { status: 400 });
  }

  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: "New password must be different from current password" },
      { status: 400 },
    );
  }

  const user = await prismaInstance.user.findUnique({
    where: { id: auth.user.id },
    select: { password: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isCurrentPasswordValid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prismaInstance.user.update({
    where: { id: auth.user.id },
    data: { password: hashedPassword },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
