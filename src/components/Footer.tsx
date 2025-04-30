"use client";

import { menuItems } from "./Navbar";

export default function Footer() {
  return (
    <footer className="bg-[#1E1E1E] text-white py-8 text-center">
      <p className="mb-6">&copy; 2025 LeadNest. All rights reserved.</p>

      {/* Menu Links */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {item}
          </a>
        ))}

        <a
          href="/login"
          className="text-gray-400 hover:text-white transition-colors"
        >
          Login
        </a>
        <a
          href="/signup"
          className="text-gray-400 hover:text-white transition-colors"
        >
          Signup
        </a>
        <a
          href="/contact"
          className="text-gray-400 hover:text-white transition-colors"
        >
          Contact Us
        </a>
      </div>

      {/* Terms Links */}
      <div className="flex justify-center gap-4 text-sm">
        <a
          href="/terms"
          className="text-gray-400 hover:text-white transition-colors"
        >
          Terms of Service
        </a>
        <a
          href="/privacy"
          className="text-gray-400 hover:text-white transition-colors"
        >
          Privacy Policy
        </a>
      </div>
    </footer>
  );
}
