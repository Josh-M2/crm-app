"use client";

import type { Testimonial } from "@/app/types/testimonials";
import TestimonialCard from "./TestimonialCard";

type TestimonialGridProps = {
  emptyMessage?: string;
  testimonials: Testimonial[];
};

export default function TestimonialGrid({
  emptyMessage = "No stories have been shared yet.",
  testimonials,
}: TestimonialGridProps) {
  if (testimonials.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      {testimonials.map((testimonial) => (
        <TestimonialCard key={testimonial.id} testimonial={testimonial} />
      ))}
    </div>
  );
}
