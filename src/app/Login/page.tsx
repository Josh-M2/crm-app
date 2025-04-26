"use client";

import { Button } from "@heroui/react";
import NavBar from "@/app/components/Navbar";
import Footer from "../components/Footer";

export default function LoginPage() {
  return (
    <>
      <NavBar />
      <section className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Login to LeadNest
          </h2>
          <form className="space-y-6">
            <div>
              <label
                className="block text-gray-700 text-sm mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" color="primary" className="w-full">
              Login
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/Signup" className="text-primary hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
