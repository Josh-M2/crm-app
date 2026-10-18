"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

export const menuItems = ["Home", "Features", "Pricing", "Customers", "Integrations"];

type NavBarProps = {
  animateEntrance?: boolean;
};

export default function NavBar({ animateEntrance = false }: NavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  function navigateToSection(sectionId: string) {
    setIsMenuOpen(false);
    if (pathname === "/") {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/?section=${sectionId}`);
    }
  }

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }

    function closeOnOutsideClick(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) setIsMenuOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.5 },
    );

    menuItems.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <header
      ref={headerRef}
      className={`fixed left-1/2 top-4 z-[9999] h-[72px] w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2 rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_15px_50px_-25px_rgba(29,45,87,0.45)] backdrop-blur-xl ${animateEntrance ? "animate-navbar-drop-in" : ""}`}
    >
      <nav aria-label="Primary" className="flex h-full items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 font-bold tracking-tight text-slate-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-base font-black text-white">L</span>
          <span>LeadNest</span>
        </Link>

        <div className="hidden items-center justify-center gap-0.5 lg:flex">
          {menuItems.map((section) => (
            <button
              key={section}
              type="button"
              onClick={() => navigateToSection(section)}
              aria-current={activeSection === section ? "location" : undefined}
              className={`min-h-10 rounded-xl px-2.5 text-sm font-medium transition-colors hover:bg-indigo-50 hover:text-indigo-700 ${activeSection === section ? "bg-indigo-50 text-indigo-700" : "text-slate-600"}`}
            >
              {section}
            </button>
          ))}
          <Link href="/contact" className="inline-flex min-h-10 items-center rounded-xl px-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700">
            Contact
          </Link>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <Link href="/login" className="hidden min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50 lg:inline-flex">
            Log in
          </Link>
          <Link href="/signup" className="hidden min-h-11 items-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 md:inline-flex">
            Get started
          </Link>
          <button
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700 lg:hidden"
          >
            {isMenuOpen ? <FiX size={24} aria-hidden="true" /> : <FiMenu size={24} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div id="mobile-navigation" aria-label="Mobile navigation" className="absolute left-0 right-0 top-[calc(100%+0.5rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl lg:hidden">
          <div className="grid gap-1">
            {menuItems.map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => navigateToSection(section)}
                className="min-h-11 rounded-xl px-4 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
              >
                {section}
              </button>
            ))}
            <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700">
              Contact Us
            </Link>
            <div className="my-1 border-t border-slate-100" />
            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700">
              Log in
            </Link>
            <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
