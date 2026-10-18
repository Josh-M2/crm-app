"use client";

import { Button } from "@heroui/react";
import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import TestimonialCard from "@/app/components/testimonials/TestimonialCard";
import type { Testimonial } from "@/app/types/testimonials";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 34 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export default function TestimonialSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchTestimonials() {
      const response = await fetch("/api/testimonials?limit=3");

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
    <motion.section
      className="bg-white px-5 py-24 text-center sm:px-8 lg:py-28"
      initial="hidden"
      whileInView="visible"
      viewport={{ amount: 0.25 }}
      variants={sectionVariants}
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Community stories</p>
      <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Hear from teams using LeadNest</h2>
      <p className="mx-auto mb-12 mt-5 max-w-2xl text-lg leading-8 text-slate-600">
        See how a shared view can help teams stay aligned on customer work.
      </p>

      {testimonials.length > 0 && <div className="mx-auto grid max-w-7xl gap-5 pb-10 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            variants={cardVariants}
            whileHover={{ y: -4 }}
          >
            <TestimonialCard testimonial={testimonial} />
          </motion.div>
        ))}
      </div>}

      <div>
        <Button
          as="a"
          href="/stories"
          color="primary"
          size="lg"
          className="mx-auto rounded-xl px-6 font-semibold"
          variant="solid"
        >
          Read stories
        </Button>
      </div>
    </motion.section>
  );
}
