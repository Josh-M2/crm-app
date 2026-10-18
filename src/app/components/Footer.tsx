"use client";

import { menuItems } from "./Navbar";

export default function Footer() {
  return (
    <footer className="bg-slate-950 px-5 py-12 text-center text-white sm:px-8">
      <p className="text-lg font-bold tracking-tight">LeadNest</p>
      <p className="mt-2 text-sm text-slate-400">Built for clearer customer relationships.</p>

      {/* Menu Links */}
      <div className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-x-6 gap-y-3 border-b border-white/10 pb-8 text-sm">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href={`/?section=${item}`}
            className="text-slate-400 transition-colors hover:text-white"
          >
            {item}
          </a>
        ))}

        <a
          href="/login"
          className="text-slate-400 transition-colors hover:text-white"
        >
          Login
        </a>
        <a
          href="/signup"
          className="text-slate-400 transition-colors hover:text-white"
        >
          Signup
        </a>
        <a
          href="/contact"
          className="text-slate-400 transition-colors hover:text-white"
        >
          Contact Us
        </a>
      </div>
      <p className="mt-8 text-xs text-slate-500">&copy; {new Date().getFullYear()} LeadNest.</p>
    </footer>
  );
}
