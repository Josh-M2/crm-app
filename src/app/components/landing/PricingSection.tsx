"use client";

import { Card, Button, Link } from "@heroui/react"; // UI Components
import { motion, type Variants } from "framer-motion"; // Animations

type Plan = {
  title: string;
  price: string;
  description: string;
  bg?: string;
  textColor1?: string;
  textColor2?: string;
  textColor3?: string;
};

const plans: Plan[] = [
  {
    title: "Free",
    price: "$0 / month",
    description: "Great for personal use or small teams with basic features.",
  },
  {
    title: "Pro",
    price: "$29 / month",
    description: "Perfect for growing teams who need advanced tools.",
  },
  {
    title: "Enterprise",
    price: "Custom Pricing",
    description: "For large companies with customize needs.",
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

const PricingCard = ({
  title,
  price,
  description,
  bg,
  textColor1,
  textColor2,
  textColor3,
}: Plan) => (
  <motion.div variants={cardVariants} whileHover={{ scale: 1.05 }}>
    <Card
      className={`p-4 max-w-xs rounded-lg border border-gray-200 text-center shadow-md hover:shadow-lg transition ${bg}`}
    >
      <h3 className={`text-xl font-semibold ${textColor1} mb-2`}>{title}</h3>
      <p className={`text-gray-600 mb-4 ${textColor2}`}>{description}</p>
      <p className={`text-lg font-bold text-gray-900 mb-6 ${textColor3}`}>
        {price}
      </p>
      <div className="flex justify-center">
        <Button
          as={Link}
          href="#signup"
          color="primary"
          className="px-6 py-2"
          variant="solid"
        >
          Get Started
        </Button>
      </div>
    </Card>
  </motion.div>
);

export default function PricingSection() {
  return (
    <motion.section
      className="py-20 bg-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ amount: 0.25 }}
      variants={sectionVariants}
    >
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-12">Choose Your Plan</h2>
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              {...plan}
              bg={index === 1 ? "" : "bg-gray-50"}
              textColor1={index === 1 ? "" : "text-gray-800"}
              textColor2={index === 1 ? "" : "text-gray-600"}
              textColor3={index === 1 ? "" : "text-gray-900"}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
