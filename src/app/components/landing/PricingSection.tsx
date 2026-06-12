"use client";

import { Card, Button, Link } from "@heroui/react";
import { motion, type Variants } from "framer-motion";

type Plan = {
  title: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  bg?: string;
  textColor1?: string;
  textColor2?: string;
  textColor3?: string;
};

const plans: Plan[] = [
  {
    title: "Starter",
    price: "$0 / month",
    description:
      "A simple way to organize early leads and test a cleaner sales workflow.",
    features: [
      "Manage up to 100 leads",
      "Basic deal tracking",
      "Single organization workspace",
      "Core dashboard overview",
    ],
    cta: "Start free",
  },
  {
    title: "Growth",
    price: "$29 / month",
    description:
      "Best for small teams that need shared visibility, faster follow-ups, and clearer reporting.",
    features: [
      "Unlimited leads and deals",
      "Team collaboration tools",
      "Sales analytics and trends",
      "Priority workflow updates",
    ],
    cta: "Choose Growth",
  },
  {
    title: "Enterprise",
    price: "Custom pricing",
    description:
      "Tailored for larger organizations with advanced access, onboarding, and process needs.",
    features: [
      "Custom team setup",
      "Advanced organization controls",
      "Dedicated onboarding support",
      "Flexible usage and security reviews",
    ],
    cta: "Talk to sales",
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
  features,
  cta,
  bg,
  textColor1,
  textColor2,
  textColor3,
}: Plan) => (
  <motion.div variants={cardVariants} whileHover={{ scale: 1.04 }}>
    <Card
      className={`flex h-full max-w-xs flex-col rounded-lg border border-gray-200 p-6 text-left shadow-md transition hover:shadow-lg ${bg}`}
    >
      <h3 className={`mb-2 text-xl font-semibold ${textColor1}`}>{title}</h3>
      <p
        className={`mb-5 min-h-[4.5rem] text-sm leading-6 text-gray-600 ${textColor2}`}
      >
        {description}
      </p>
      <p className={`mb-6 text-2xl font-bold text-gray-900 ${textColor3}`}>
        {price}
      </p>
      <ul className="mb-8 flex flex-1 flex-col gap-3 text-sm text-gray-600">
        {features.map((feature) => (
          <li key={feature} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563EB]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="flex">
        <Button
          as={Link}
          href="/signup"
          color="primary"
          className="w-full px-6 py-2"
          variant="solid"
        >
          {cta}
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
      <div className="container mx-auto px-6 text-center">
        <h2 className="mb-4 text-4xl font-bold">Pricing that grows with you</h2>
        <p className="mx-auto mb-12 max-w-2xl text-lg text-gray-600">
          Start with the basics, upgrade when your team needs more structure,
          and keep every plan focused on practical CRM work.
        </p>
        <div className="flex flex-wrap items-stretch justify-center gap-8 mb-12">
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
