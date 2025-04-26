"use client";

import { Button } from "@heroui/react"; // Assuming HeroUI has Button component

export default function Home() {
  return (
    <section className="flex flex-col justify-center items-center min-h-screen px-8">
      <h1 className="text-5xl font-bold mb-4 text-center">LeadNest</h1>
      <p className="text-xl mb-8 text-center">Your Simplified CRM</p>
      <p className="text-lg mb-8 text-center">
        Manage leads, track sales, and collaborate with your team effortlessly.
      </p>
      {/* Get Started Button */}
      <Button
        as="a"
        href="#signup"
        color="primary"
        size="lg"
        className="text-white bg-blue-600 hover:bg-blue-700 transition duration-300 px-8 py-3 rounded-lg"
      >
        Get Started
      </Button>
    </section>
  );
}
