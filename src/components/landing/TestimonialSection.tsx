"use client";

import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import UserAvatar from "../UserAvatar";

// 1. Define the Testimonial type
type Testimonial = {
  name: string;
  title: string;
  message: string;
};

// 2. Strongly type the array
const testimonials: Testimonial[] = [
  {
    name: "John Doe",
    title: "CEO at ExampleCorp",
    message:
      "LeadNest has completely changed the way we handle leads. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    name: "Jane Smith",
    title: "Marketing Manager at StartupX",
    message:
      "Amazing platform! Our team became 2x more productive. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    name: "Alice Johnson",
    title: "Sales Lead at BigCompany",
    message:
      "A must-have tool for any modern business. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];

export default function TestimonialSection() {
  return (
    <section className="bg-gray-100 py-16 px-4 text-center">
      <h2 className="text-3xl font-bold mb-12 ">What Our Customers Say</h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center transition"
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

            <p className="text-gray-600 mb-6">"{testimonial.message}"</p>

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
          See more
        </Button>
      </div>
    </section>
  );
}
