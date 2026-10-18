"use client";

import { menuItems } from "./Navbar";

export default function Footer() {
  return (
    <footer className="bg-[#1E1E1E] text-white py-8 text-center">
      <p className="mb-6">
        &copy; 2026 LeadNest. Built for clearer customer relationships.
      </p>

      {/* Menu Links */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href={`/?section=${item}`}
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
    </footer>
  );
}
