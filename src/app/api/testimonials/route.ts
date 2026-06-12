import prismaInstance from "@/app/lib/prismaInstance";
import { getCurrentUser } from "@/app/lib/routeAuth";
import { NextRequest, NextResponse } from "next/server";

const cleanText = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export async function GET(req: NextRequest) {
  const limitParam = Number(req.nextUrl.searchParams.get("limit") || 12);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), 50)
    : 12;

  const testimonials = await prismaInstance.testimonial.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      title: true,
      message: true,
      rating: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ testimonials }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const auth = await getCurrentUser(req);

  if ("response" in auth) return auth.response;

  const body = await req.json();
  const title = cleanText(body.title);
  const message = cleanText(body.message);
  const rating = Number(body.rating || 5);

  if (!title || title.length > 120) {
    return NextResponse.json(
      { error: "Title is required and must be 120 characters or less." },
      { status: 400 }
    );
  }

  if (message.length < 20 || message.length > 600) {
    return NextResponse.json(
      { error: "Message must be between 20 and 600 characters." },
      { status: 400 }
    );
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5." },
      { status: 400 }
    );
  }

  const user = await prismaInstance.user.findUnique({
    where: { id: auth.user.id },
    select: { name: true },
  });

  const name = user?.name || auth.user.email;

  const testimonial = await prismaInstance.testimonial.create({
    data: {
      name,
      title,
      message,
      rating,
      isPublished: true,
      userId: auth.user.id,
    },
    select: {
      id: true,
      name: true,
      title: true,
      message: true,
      rating: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ testimonial }, { status: 201 });
}
