"use client";

import { Button } from "@heroui/react";
import { motion, type Variants } from "framer-motion";

// 1. Define the Feature type
type Feature = {
  title: string;
  description: string;
};

// 2. Strongly type the array
const features: Feature[] = [
  {
    title: "Lead Management",
    description:
      "Track and manage your leads with a simple, intuitive dashboard.",
  },
  {
    title: "Team Collaboration",
    description:
      "Collaborate with your team in real-time to close deals faster.",
  },
  {
    title: "Analytics & Insights",
    description: "Get detailed insights about your sales performance.",
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

export default function FeaturesSection() {
  return (
    <motion.section
      className="bg-gray-100 py-8 px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ amount: 0.25 }}
      variants={sectionVariants}
    >
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">Features</h2>
        <p className="text-lg mb-12">
          Everything you need to manage your customers, leads, and sales — all
          in one platform.
        </p>

        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ scale: 1.05 }}
              className="max-w-xs bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition"
            >
              <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <Button
          as="a"
          href="#"
          color="primary"
          size="lg"
          className="mx-auto"
          variant="solid"
        >
          Explore more
        </Button>
      </div>
    </motion.section>
  );
}
