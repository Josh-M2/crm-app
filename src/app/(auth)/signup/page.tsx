"use client";

import { Button, Link } from "@heroui/react";
import NavBar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/app/lib/axiosInstance";
import {
  validateEmail,
  validateName,
  validatePassword,
  validateRepeatPassword,
} from "@/app/lib/validators";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { inputChange } from "@/app/lib/inputChange";
import { SignupFormTypes } from "@/app/types/auth";
import { ErrorSignupFormTypes } from "@/app/types/auth";
import Image from "next/image";

type AuthRequestError = {
  status?: number;
  response?: {
    status?: number;
    data?: {
      error?: string;
    };
  };
};

export default function SignupPage() {
  const { data: session } = useSession();
  const componentName = useMemo(() => "signup", []);
  const errorImageURL = useMemo(() => "/circle-exclamation-solid.svg", []);
  const [form, setForm] = useState<SignupFormTypes>({
    name: "",
    email: "",
    password: "",
    repassword: "",
  });
  const [error, setError] = useState<ErrorSignupFormTypes>({
    nameError: "",
    emailError: "",
    passwordError: "",
    repasswordError: "",
  });
  const [loading, setIsLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    inputChange({ e, setForm, setError, form, componentName });

  const handleSubmitSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");
    const nameError = validateName(form.name as string);
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password, componentName);
    const repasswordError = validateRepeatPassword(
      form.password,
      form.repassword as string
    );

    if (
      nameError === null &&
      emailError === null &&
      passwordError === null &&
      repasswordError == null
    ) {
      try {
        const response = await axiosInstance.post("/auth/signup", form);

        if (response.status === 201) {
          const res = await signIn("credentials", {
            email: form.email,
            password: form.password,
            redirect: false,
          });
          if (res?.ok) {
            router.push("/dashboard");
          } else {
            setFormError("Account created, but we could not log you in. Please use the login page.");
          }
        } else {
          setFormError("Unable to create your account. Please try again.");
        }
      } catch (error: unknown) {
        const requestError = error as AuthRequestError;
        if (requestError.status === 409 || requestError.response?.status === 409) {
          setError((prev) => ({
            ...prev,
            emailError: requestError.response?.data?.error ?? "Signup failed.",
          }));
          setIsLoading(false);
          return;
        }

        setFormError("Unable to create your account. Please try again.");
      }
    } else {
      setError({
        nameError: nameError,
        emailError: emailError,
        passwordError: passwordError,
        repasswordError: repasswordError,
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <>
      <NavBar />
      <section className="flex min-h-screen items-center justify-center bg-[#f7f9ff] px-4 pb-16 pt-32 sm:px-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_25px_70px_-35px_rgba(25,40,75,0.3)] sm:p-9">
          <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Create your workspace</p>
          <h1 className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900">Get started with LeadNest</h1>
          <p className="mb-8 mt-2 text-center text-sm text-slate-500">A clearer place for your leads and deals.</p>
          {formError && <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</p>}
          <form className="space-y-6" onSubmit={handleSubmitSignup}>
            <div>
              <label
                className="block text-gray-700 text-sm mb-2"
                htmlFor="name"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                autoComplete="name"
                required
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            {error.nameError && (
              <label className="flex items-center !mt-1 text-rose-600 text-xs">
                <Image
                  src={errorImageURL}
                  alt="error exclamatory"
                  width={12}
                  height={12}
                  className="mr-1"
                />
                {error.nameError}
              </label>
            )}
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
                name="email"
                autoComplete="email"
                required
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            {error.emailError && (
              <label className="flex items-center !mt-1 text-rose-600 text-xs">
                <Image
                  src={errorImageURL}
                  alt="error exclamatory"
                  width={12}
                  height={12}
                  className="mr-1"
                />
                {error.emailError}
              </label>
            )}

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
                name="password"
                autoComplete="new-password"
                required
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            {error.passwordError && (
              <label className="flex items-center !mt-1 text-rose-600 text-xs">
                <Image
                  src={errorImageURL}
                  alt="error exclamatory"
                  width={12}
                  height={12}
                  className="mr-1"
                />
                {error.passwordError}
              </label>
            )}

            <div>
              <label
                className="block text-gray-700 text-sm mb-2"
                htmlFor="repassword"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="repassword"
                name="repassword"
                autoComplete="new-password"
                required
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
                value={form.repassword}
                onChange={handleChange}
              />
            </div>
            {error.repasswordError && (
              <label className="flex items-center !mt-1 text-rose-600 text-xs">
                <Image
                  src={errorImageURL}
                  alt="error exclamatory"
                  width={12}
                  height={12}
                  className="mr-1"
                />
                {error.repasswordError}
              </label>
            )}

            <Button
              type="submit"
              color="primary"
              className="min-h-11 w-full rounded-xl bg-indigo-600 font-semibold text-white"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
