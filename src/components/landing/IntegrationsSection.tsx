"use client";

import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import {
  FaSlack,
  FaMap,
  FaSalesforce,
  FaGoogle,
  FaMailchimp,
  FaStripe,
  FaHubspot,
  FaIntercom,
} from "react-icons/fa";

type Integration = {
  name: string;
  Icon: React.ElementType;
};

const integrations: Integration[] = [
  { name: "Slack", Icon: FaSlack },
  { name: "Zapier", Icon: FaMap },
  { name: "Salesforce", Icon: FaSalesforce },
  { name: "Google Sheets", Icon: FaGoogle },
  { name: "Mailchimp", Icon: FaMailchimp },
  { name: "Stripe", Icon: FaStripe },
  { name: "HubSpot", Icon: FaHubspot },
  { name: "Intercom", Icon: FaIntercom },
];

export default function IntegrationSection() {
  return (
    <section className="bg-white py-16">
      <div className=" mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6 ">Seamless Integrations</h2>
        <p className="text-gray-500 mb-12">
          Connect LeadNest to your favorite tools and streamline your workflow.
        </p>

        {/* Marquee effect */}
        <div className="overflow-hidden relative w-full pb-16">
          <motion.div
            className="flex gap-12"
            animate={{ x: ["0%", "-100%"] }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration: 20,
              ease: "linear",
            }}
          >
            {integrations.concat(integrations).map(
              (
                integration,
                index // duplicate for infinite scroll
              ) => (
                <div
                  key={index}
                  className="flex flex-col items-center min-w-[150px]"
                >
                  <integration.Icon className="text-4xl text-gray-500 mb-2" />
                  <span className="text-gray-500 font-medium">
                    {integration.name}
                  </span>
                </div>
              )
            )}
          </motion.div>
        </div>
        <div>
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
      </div>
    </section>
  );
}
