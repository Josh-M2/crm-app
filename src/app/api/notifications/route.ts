import prismaInstance from "@/app/lib/prismaInstance";
import { getCurrentUser } from "@/app/lib/routeAuth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const auth = await getCurrentUser(req);

  if ("response" in auth) return auth.response;

  const notifications = await prismaInstance.notification.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ notifications }, { status: 200 });
}

export async function PATCH(req: NextRequest) {
  const auth = await getCurrentUser(req);

  if ("response" in auth) return auth.response;

  const { notificationId } = await req.json();

  if (!notificationId) {
    return NextResponse.json({ error: "missing notification" }, { status: 400 });
  }

  const notification = await prismaInstance.notification.updateMany({
    where: {
      id: notificationId,
      userId: auth.user.id,
    },
    data: { read: true },
  });

  if (notification.count === 0) {
    return NextResponse.json({ error: "notification not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
