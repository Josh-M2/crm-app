"use client";

import { Button, Link } from "@heroui/react";

export default function CTASection() {
  return (
    <section className="bg-gray-100 py-28 text-center">
      <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
      <p className="text-lg mb-6">
        Sign up today and start managing your leads like never before.
      </p>
      <Button as={Link} href="/signup" color="primary" size="lg">
        Get Started
      </Button>
    </section>
  );
}
