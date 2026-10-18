"use client";

import { Button, Link } from "@heroui/react";
import { motion, type Variants } from "framer-motion";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 34 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

export default function CTASection() {
  return (
    <motion.section
      className="bg-[#f7f9ff] px-5 py-24 text-center sm:px-8 lg:py-28"
      initial="hidden"
      whileInView="visible"
      viewport={{ amount: 0.35 }}
      variants={sectionVariants}
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Your next step</p>
      <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Ready to organize your pipeline?</h2>
      <p className="mx-auto mt-5 mb-8 max-w-2xl text-lg leading-8 text-slate-600">
        Create your workspace, invite your team, and start turning lead activity
        into clear next actions.
      </p>
      <Button as={Link} href="/signup" color="primary" size="lg" className="rounded-xl bg-indigo-600 px-7 font-semibold text-white">
        Start your workspace
      </Button>
    </motion.section>
  );
}
