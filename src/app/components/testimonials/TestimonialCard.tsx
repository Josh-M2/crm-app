"use client";

import UserAvatar from "@/app/components/UserAvatar";
import type { Testimonial } from "@/app/types/testimonials";
import { Card } from "@heroui/react";

type TestimonialCardProps = {
  testimonial: Testimonial;
};

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card className="flex h-full flex-col items-center rounded-lg border border-gray-200 bg-white p-8 text-center shadow-lg transition-shadow duration-300 hover:shadow-xl">
      <div className="mb-4 flex text-yellow-400" aria-label={`${testimonial.rating} star rating`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <svg
            key={index}
            xmlns="http://www.w3.org/2000/svg"
            fill={index < testimonial.rating ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="h-5 w-5"
          >
            <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.787 1.402 8.172L12 18.896l-7.336 3.857 1.402-8.172L.132 9.209l8.2-1.191z" />
          </svg>
        ))}
      </div>

      <p className="mb-6 flex-1 text-gray-600">&quot;{testimonial.message}&quot;</p>

      <UserAvatar description={testimonial.title} name={testimonial.name} />
    </Card>
  );
}
