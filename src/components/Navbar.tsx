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

export const AcmeLogo = () => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export const menuItems = [
  "Home",
  "Features",
  "Pricing",
  "Customers",
  "Integrations",
];

export default function NavBar() {
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
      }
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
    <Navbar onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <AcmeLogo />
          <p className="font-bold text-inherit">LeadNest</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuItems.map((section, index) => (
          <NavbarItem key={index}>
            <Button
              variant="light"
              onPress={() => handleNavClick(section)}
              className={`transition ${
                activeSection === section ? "bg-gray-200" : ""
              }`}
            >
              {section}
            </Button>
          </NavbarItem>
        ))}
        <NavbarItem className="hidden lg:flex">
          <Button as={Link} variant="light" href="/contact">
            Contact
          </Button>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Button as={Link} color="primary" href="/login" variant="light">
            Login
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} color="primary" href="/signup" variant="solid">
            Sign Up
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
              href="#"
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
