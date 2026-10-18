"use client";

import { Button } from "@heroui/react";
import { motion, type Variants } from "framer-motion";

type Feature = {
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    title: "Organized Lead Pipeline",
    description:
      "Capture new prospects, sort them by stage, and keep every follow-up visible from a clean dashboard.",
  },
  {
    title: "Shared Team Workspace",
    description:
      "Give everyone the same customer context so handoffs, notes, and next steps stay aligned.",
  },
  {
    title: "Actionable Sales Insights",
    description:
      "Spot pipeline trends, review performance, and focus your team on the opportunities most likely to close.",
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
      className="bg-white px-5 py-24 sm:px-8 lg:py-28"
      initial="hidden"
      whileInView="visible"
      viewport={{ amount: 0.25 }}
      variants={sectionVariants}
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">What you can do</p>
        <h2 className="mt-3 text-center text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Everything in its place</h2>
        <p className="mx-auto mt-5 mb-14 max-w-2xl text-center text-lg leading-8 text-slate-600">
          Everything your team needs to manage customers, leads, and sales in
          one reliable workspace.
        </p>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-slate-200 bg-[#f8faff] p-7 transition-shadow hover:shadow-xl hover:shadow-indigo-100/70"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">0{index + 1}</span>
              <h3 className="mt-8 text-xl font-bold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center"><Button
          as="a"
          href="/signup"
          color="primary"
          size="lg"
          className="rounded-xl px-6 font-semibold"
          variant="solid"
        >
          Try LeadNest
        </Button></div>
      </div>
    </motion.section>
  );
}
