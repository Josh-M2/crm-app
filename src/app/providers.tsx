"use client";

import { HeroUIProvider } from "@heroui/react";
import { SessionProvider } from "next-auth/react";
import { OrganizationProvider } from "./context/OrganizationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OrganizationProvider>
        <HeroUIProvider>{children}</HeroUIProvider>
      </OrganizationProvider>
    </SessionProvider>
  );
}
