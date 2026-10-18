"use client";

import React, { useEffect, useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Button,
} from "@heroui/react";
import { useRouter, usePathname } from "next/navigation";

// export const AcmeLogo = () => {
//   return (
//     <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
//       <path
//         clipRule="evenodd"
//         d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
//         fill="currentColor"
//         fillRule="evenodd"
//       />
//     </svg>
//   );
// };

export const menuItems = [
  "Home",
  "Features",
  "Pricing",
  "Customers",
  "Integrations",
];

type NavBarProps = {
  animateEntrance?: boolean;
};

export default function NavBar({ animateEntrance = false }: NavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const router = useRouter();
  const pathname = usePathname();

  const handleNavClick = (sectionId: string) => {
    if (pathname === "/") {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push(`/?section=${sectionId}`);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (id) {
              setActiveSection(id);
            }
          }
        });
      },
      {
        threshold: 0.5, // section becomes active when 60% visible
      },
    );

    menuItems.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => {
      menuItems.forEach((id) => {
        const section = document.getElementById(id);
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  //   const menuItems = [
  //     "Profile",
  //     "Dashboard",
  //     "Activity",
  //     "Analytics",
  //     "System",
  //     "Deployments",
  //     "My Settings",
  //     "Team Settings",
  //     "Help & Feedback",
  //     "Log Out",
  //   ];

  return (
    <Navbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      style={{ "--navbar-height": "72px" } as React.CSSProperties}
      className={`fixed left-1/2 top-4 z-[9999] h-[72px] min-h-[72px] w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2 rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_15px_50px_-25px_rgba(29,45,87,0.45)] backdrop-blur-xl ${
        animateEntrance ? "animate-navbar-drop-in" : ""
      }`}
      classNames={{
        wrapper: "h-full max-w-7xl px-4 sm:px-6",
        menu: "z-[9999]",
      }}
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="lg:hidden"
        />
        <NavbarBrand>
          <Link href="/" color="foreground" className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-base font-black text-white">L</span> LeadNest
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden lg:flex gap-1" justify="center">
        {menuItems.map((section, index) => (
          <NavbarItem key={index}>
            <Button
              variant="light"
              onPress={() => handleNavClick(section)}
              className={`min-h-10 min-w-0 px-3 text-sm font-medium text-slate-600 transition-colors hover:text-indigo-700 ${
                activeSection === section ? "bg-indigo-50 text-indigo-700" : ""
              }`}
            >
              {section}
            </Button>
          </NavbarItem>
        ))}
        <NavbarItem>
          <Button as={Link} variant="light" href="/contact" className="min-h-10 text-sm font-medium text-slate-600">
            Contact
          </Button>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="hidden md:flex">
          <Button as={Link} color="primary" href="/login" variant="light" className="min-h-11 font-semibold">
            Log in
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} color="primary" href="/signup" variant="solid" className="min-h-11 rounded-xl bg-indigo-600 px-5 font-semibold text-white">
            Get started
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full"
              color={
                index === 0
                  ? "primary"
                  : index === menuItems.length - 1
                    ? "foreground" //danger
                    : "foreground"
              }
              href={`/?section=${item}`}
              onPress={() => setIsMenuOpen(false)}
              size="lg"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}

        <NavbarMenuItem>
          <Link
            className="w-full"
            color={"foreground"}
            href="/contact"
            size="lg"
          >
            Contact Us
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link className="w-full" color={"foreground"} href="/login" size="lg">
            Login
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link
            className="w-full"
            color={"foreground"}
            href="/signup"
            size="lg"
          >
            Signup
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
