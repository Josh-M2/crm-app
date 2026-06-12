"use client";

import FooterSection from "@/app/components/Footer";
import NavBar from "@/app/components/Navbar";
import TestimonialGrid from "@/app/components/testimonials/TestimonialGrid";
import type { Testimonial } from "@/app/types/testimonials";
import { Button } from "@heroui/react";
import { useEffect, useState } from "react";

export default function StoriesPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchTestimonials() {
      const response = await fetch("/api/testimonials?limit=50");

      if (!response.ok) return;

      const data = await response.json();
      if (isMounted) setTestimonials(data.testimonials || []);
    }

    fetchTestimonials();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <NavBar />

      <section className="px-4 pb-20 pt-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="mb-3 text-4xl font-bold text-gray-950">
                Customer Stories
              </h1>
              <p className="max-w-2xl text-gray-600">
                Read how LeadNest users organize customer work, follow-ups, and
                sales conversations.
              </p>
            </div>

            <Button as="a" href="/testimony" color="primary">
              Share your story
            </Button>
          </div>

          <TestimonialGrid testimonials={testimonials} />
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
