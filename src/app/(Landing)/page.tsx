"use client";

import FeatureSection from "@/components/landing/FeaturesSection";
import HomeSection from "@/components/landing/Home";
import PricingSection from "@/components/landing/PricingSection";
import TestimonilaScetion from "@/components/landing/TestimonialSection";
import CTASection from "@/components/landing/CTASection";
import FooterSection from "@/components/Footer";
import NavBar from "@/components/Navbar";
import IntegrationSection from "@/components/landing/IntegrationsSection";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function LandingPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const section = searchParams.get("section");
    if (section) {
      const element = document.getElementById(section);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [searchParams]);

  return (
    <main className="flex flex-col min-h-screen">
      <NavBar />

      <section id="Home">
        <HomeSection />
      </section>
      <section id="Features">
        <FeatureSection />
      </section>
      <section id="Pricing">
        <PricingSection />
      </section>
      <section id="Customers">
        <TestimonilaScetion />
      </section>
      <section id="Integrations">
        <IntegrationSection />
      </section>

      <section id="Contact">
        <CTASection />
      </section>

      <FooterSection />
    </main>
  );
}
