"use client";

import { Button } from "@heroui/react";
import { motion, type Variants } from "framer-motion";
import UserAvatar from "../UserAvatar";

type Testimonial = {
  name: string;
  title: string;
  message: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Marcus Chen",
    title: "Founder at Northstar Ops",
    message:
      "LeadNest gave our team one place to qualify leads, assign follow-ups, and see which deals needed attention first.",
  },
  {
    name: "Priya Shah",
    title: "Marketing Manager at BrightLoop",
    message:
      "The handoff from marketing to sales is much clearer now. We spend less time chasing status updates and more time moving leads forward.",
  },
  {
    name: "Elena Brooks",
    title: "Sales Lead at Atlas Group",
    message:
      "Our pipeline reviews feel calmer because the data is easy to scan and everyone knows the next step for each account.",
  },
];

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
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{ scale: 1.05 }}
            className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex justify-between flex-col items-center transition"
          >
            {/* Five stars */}
            <div className="flex mb-4 text-yellow-400">
              {Array.from({ length: 5 }).map((_, starIndex) => (
                <svg
                  key={starIndex}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                >
                  <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.787 1.402 8.172L12 18.896l-7.336 3.857 1.402-8.172L.132 9.209l8.2-1.191z" />
                </svg>
              ))}
            </div>

            <p className="text-gray-600 mb-6">
              &quot;{testimonial.message}&quot;
            </p>

            <UserAvatar
              description={testimonial.title}
              name={testimonial.name}
            />
          </motion.div>
        ))}
      </div>

      <div>
        <Button
          as="a"
          href="#"
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
