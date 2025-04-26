"use client";

import { Card, Button, Link } from "@heroui/react"; // UI Components
import { motion } from "framer-motion"; // Animations

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

const PricingCard = ({
  title,
  price,
  description,
  bg,
  textColor1,
  textColor2,
  textColor3,
}: Plan) => (
  <motion.div whileHover={{ scale: 1.05 }}>
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
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-12">Choose Your Plan</h2>
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              {...plan}
              bg={index === 1 ? "" : "bg-transparent"}
              textColor1={index === 1 ? "" : "text-gray-800"}
              textColor2={index === 1 ? "" : "text-gray-600"}
              textColor3={index === 1 ? "" : "text-gray-900"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
