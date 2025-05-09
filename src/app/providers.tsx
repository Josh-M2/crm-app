"use client";

import { HeroUIProvider } from "@heroui/react";
import { SessionProvider } from "next-auth/react";
import { OrganizationProvider } from "./context/OrganizationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <HeroUIProvider>
        <OrganizationProvider>{children}</OrganizationProvider>
      </HeroUIProvider>
    </SessionProvider>
  );
}
