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
      className="bg-gray-100 py-16 px-4 text-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ amount: 0.25 }}
      variants={sectionVariants}
    >
      <h2 className="text-3xl font-bold mb-4">Trusted by growing teams</h2>
      <p className="mx-auto mb-12 max-w-2xl text-gray-600">
        Sales and operations teams use LeadNest to keep customer work visible,
        accountable, and easier to repeat.
      </p>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
        {testimonials.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            variants={cardVariants}
            whileHover={{ scale: 1.05 }}
          >
            <TestimonialCard testimonial={testimonial} />
          </motion.div>
        ))}
      </div>

      <div>
        <Button
          as="a"
          href="/stories"
          color="primary"
          size="lg"
          className="mx-auto"
          variant="solid"
        >
          Read stories
        </Button>
      </div>
    </motion.section>
  );
}
