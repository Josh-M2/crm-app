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
import axiosInstance from "@/app/lib/axiosInstance";

const loginErrorMap: Record<string, { fieldName?: string; message: string }> = {
  MissingInputs: { message: "Missing email and password" },
  UserNotFound: { fieldName: "emailError", message: "Email not found" },
  WrongPassword: { fieldName: "passwordError", message: "Incorrect password" },
};
type AuthRequestError = {
  status?: number;
  response?: {
    status?: number;
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
  const [formError, setFormError] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    inputChange({ e, setForm, setError, form, componentName });

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password, componentName);

    if (emailError === null && passwordError === null) {
      try {
        const res = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });
        if (res?.ok) {
          router.push("/dashboard");
        } else if (res?.error) {
          const loginErrorMessage = loginErrorMap[res.error] ?? {
            message: "Login failed. Please try again.",
          };
          if (loginErrorMessage.fieldName) {
            setError((prev) => ({ ...prev, [loginErrorMessage.fieldName as string]: loginErrorMessage.message }));
          } else {
            setFormError(loginErrorMessage.message);
          }
        }
      } catch (error: unknown) {
        const requestError = error as AuthRequestError;
        if (requestError.status === 409 || requestError.response?.status === 409) {
          setError((prev) => ({
            ...prev,
            emailError: requestError.response?.data?.error ?? "Login failed.",
          }));
          setIsLoading(false);
          return;
        }

        setFormError("Unable to log in right now. Please try again.");
      }
    } else {
      setError({
        emailError: emailError,
        passwordError: passwordError,
      });
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    const emailError = validateEmail(forgotEmail);

    setForgotError("");
    setForgotSuccess("");

    if (emailError) {
      setForgotError(emailError);
      return;
    }

    setForgotLoading(true);

    try {
      await axiosInstance.post("/auth/forgot-password", { email: forgotEmail });
      setForgotSuccess("Password reset email sent.");
    } catch (error: unknown) {
      const requestError = error as AuthRequestError;
      setForgotError(
        requestError.response?.data?.error ?? "Unable to send reset email.",
      );
    } finally {
      setForgotLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <>
      <NavBar />
      <section className="flex min-h-screen items-center justify-center bg-[#f7f9ff] px-4 pb-16 pt-32 sm:px-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_25px_70px_-35px_rgba(25,40,75,0.3)] sm:p-9">
          <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Welcome back</p>
          <h1 className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900">Log in to LeadNest</h1>
          <p className="mb-8 mt-2 text-center text-sm text-slate-500">Pick up where your team left off.</p>
          {formError && <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</p>}
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
                autoComplete="current-password"
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
            <div className="text-right !mt-2">
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                aria-expanded={forgotOpen}
                aria-controls="password-reset-panel"
                onClick={() => {
                  setForgotOpen((prev) => !prev);
                  setForgotEmail(form.email);
                  setForgotError("");
                  setForgotSuccess("");
                }}
              >
                Forgot password?
              </button>
            </div>
            {forgotOpen && <div id="password-reset-panel" className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <label
                    className="block text-gray-700 text-sm mb-2"
                    htmlFor="forgot-email"
                  >
                    Reset Password
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={forgotEmail}
                    onChange={(event) => setForgotEmail(event.target.value)}
                    placeholder="you@example.com"
                  />
                  {forgotError && (
                    <p className="mt-2 text-xs text-rose-600">{forgotError}</p>
                  )}
                  {forgotSuccess && (
                    <p className="mt-2 text-xs text-green-700">
                      {forgotSuccess}
                    </p>
                  )}
                  <Button
                    type="button"
                    color="primary"
                    className="mt-3 w-full"
                    disabled={forgotLoading}
                    onPress={handleForgotPassword}
                  >
                    Send reset password link
                  </Button>
            </div>}
            <Button
              type="submit"
              color="primary"
              className="min-h-11 w-full rounded-xl bg-indigo-600 font-semibold text-white"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
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
