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
      className="bg-gray-100 py-28 text-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ amount: 0.35 }}
      variants={sectionVariants}
    >
      <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
      <p className="text-lg mb-6">
        Sign up today and start managing your leads like never before.
      </p>
      <Button as={Link} href="/signup" color="primary" size="lg">
        Get Started
      </Button>
    </motion.section>
  );
}
