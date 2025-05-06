"use client";

import { Button } from "@heroui/react";
import NavBar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import {
  validateEmail,
  validateName,
  validatePassword,
  validateRepeatPassword,
} from "@/lib/validators";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { inputChange } from "@/lib/inputChange";

export type SignupFormTypes = {
  name: string;
  email: string;
  password: string;
  repassword: string;
};

export type ErrorSignupFormTypes = {
  nameError: string | null;
  emailError: string | null;
  passwordError: string | null;
  repasswordError: string | null;
};

export default function SignupPage() {
  const { data: session, status } = useSession();
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
      } catch (error: any) {
        if (error.status === 409) {
          console.log("error message", error.response.data.error);
          setError((prev) => ({
            ...prev,
            emailError: error.response.data.error,
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
    const checkToken = async () => {
      try {
        const response = await axiosInstance.get("/auth/check-token");
        if (response.data.status === 200) router.push("/dashboard");
      } catch (error) {
        console.error("error checking token: ", error);
      }
    };
    if (session) {
      checkToken();
    }
  }, [session]);

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
                <img
                  src={errorImageURL}
                  alt="error exclamatory"
                  className="max-w-[5%] mr-1"
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
                <img
                  src={errorImageURL}
                  alt="error exclamatory"
                  className="max-w-[5%] mr-1"
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
                <img
                  src={errorImageURL}
                  alt="error exclamatory"
                  className="max-w-[5%] mr-1"
                />
                {error.passwordError}
              </label>
            )}

            <div>
              <label
                className="block text-gray-700 text-sm mb-2"
                htmlFor="repassword"
              >
                Password
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
                <img
                  src={errorImageURL}
                  alt="error exclamatory"
                  className="max-w-[5%] mr-1"
                />
                {error.repasswordError}
              </label>
            )}

            <Button
              type="submit"
              color="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? "loading" : "Sign Up"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-primary hover:underline">
              Login
            </a>
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
