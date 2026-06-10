"use client";

import { Button, Link } from "@heroui/react";
import NavBar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { inputChange } from "@/app/lib/inputChange";
import { validateEmail, validatePassword } from "@/app/lib/validators";
import { signIn, useSession } from "next-auth/react";
import { LoginFormTypes } from "@/app/types/auth";
import { ErrorLoginFormTypes } from "@/app/types/auth";
import Image from "next/image";

const loginErrorMap: Record<string, { fieldName?: string; message: string }> = {
  MissingInputs: { message: "Missing email and password" },
  UserNotFound: { fieldName: "emailError", message: "Email not found" },
  WrongPassword: { fieldName: "passwordError", message: "Incorrect password" },
};
type AuthRequestError = {
  status?: number;
  response?: {
    data?: {
      error?: string;
    };
  };
};

export default function LoginPage() {
  const { status } = useSession();
  const componentName = useMemo(() => "login", []);
  const errorImageURL = useMemo(() => "/circle-exclamation-solid.svg", []);
  const [form, setForm] = useState<LoginFormTypes>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<ErrorLoginFormTypes>({
    emailError: "",
    passwordError: "",
  });
  const [loading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    inputChange({ e, setForm, setError, form, componentName });

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("submitted: ", form.email);
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password, componentName);

    if (emailError === null && passwordError === null) {
      console.log("calkling signup api ");
      try {
        // const response = await axiosInstance.post("/auth/login", form);

        // console.log("succesfully signeup", response.data);
        // console.log("succesfully signeup", response.data.user.email);
        // console.log("succesfully signeup", response.data.user.password);
        const res = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });
        if (res?.ok) {
          console.log("res: ", res);
          router.push("/dashboard");
        } else if (res?.error) {
          console.log("error: ", res?.error);
          const loginErrorMessage = loginErrorMap[res.error] ?? {
            message: "Login failed. Please try again.",
          };

          console.log("loginErrorMessage: ", loginErrorMessage);

          setError((prev) => ({
            ...prev,
            [loginErrorMessage.fieldName as string]: loginErrorMessage.message,
          }));
        }
      } catch (error: unknown) {
        const requestError = error as AuthRequestError;
        if (requestError.status === 409) {
          console.log("error message", requestError.response?.data?.error);
          setError((prev) => ({
            ...prev,
            emailError: requestError.response?.data?.error ?? "Login failed.",
          }));
          setIsLoading(false);
          return;
        }

        console.error("error Signup", error);
      }
    } else {
      setError({
        emailError: emailError,
        passwordError: passwordError,
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <>
      <NavBar />
      <section className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Login to LeadNest
          </h2>
          <form className="space-y-6" onSubmit={handleSubmitLogin}>
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
            <Button
              type="submit"
              color="primary"
              className="w-full"
              disabled={loading}
            >
              Login
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Signup
            </Link>
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
