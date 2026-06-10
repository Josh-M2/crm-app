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
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    inputChange({ e, setForm, setError, form, componentName });

  const handleSubmitSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("submitted: ", form);
    const nameError = validateName(form.name as string);
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password, componentName);
    const repasswordError = validateRepeatPassword(
      form.password,
      form.repassword as string
    );
    console.log(nameError);

    if (
      nameError === null &&
      emailError === null &&
      passwordError === null &&
      repasswordError == null
    ) {
      console.log("calkling signup api ");
      try {
        const response = await axiosInstance.post("/auth/signup", form);

        if (response.status === 201) {
          console.log("succesfully signeup", response.data);
          console.log("succesfully signeup", response.data.user.email);
          console.log("succesfully signeup", response.data.user.password);
          const res = await signIn("credentials", {
            email: form.email,
            password: form.password,
            redirect: false,
          });
          if (res?.ok) {
            console.log("res: ", res);
            router.push("/dashboard");
          }
        } else {
          console.error("something went wrong in signup api request ");
        }
      } catch (error: unknown) {
        const requestError = error as AuthRequestError;
        if (requestError.status === 409) {
          console.log("error message", requestError.response?.data?.error);
          setError((prev) => ({
            ...prev,
            emailError: requestError.response?.data?.error ?? "Signup failed.",
          }));
          setIsLoading(false);
          return;
        }

        console.error("error Signup", error);
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
      <section className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Create Your Account
          </h2>
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
              className="w-full"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "loading" : "Sign Up"}
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
