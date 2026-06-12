"use client";

import { Button, Link } from "@heroui/react";
import Footer from "@/app/components/Footer";
import NavBar from "@/app/components/Navbar";
import axiosInstance from "@/app/lib/axiosInstance";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

type AuthRequestError = {
  response?: {
    data?: {
      error?: string;
    };
  };
};

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleConfirm = async () => {
    setError("");
    setSuccess("");

    if (!token) {
      setError("Reset token is missing.");
      return;
    }

    setConfirming(true);

    try {
      await axiosInstance.get(`/auth/reset-password?token=${encodeURIComponent(token)}`);
      setConfirmed(true);
    } catch (error: unknown) {
      const requestError = error as AuthRequestError;
      setError(
        requestError.response?.data?.error ?? "Reset link is invalid or expired."
      );
    } finally {
      setConfirming(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!password || !repeatPassword) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await axiosInstance.post("/auth/reset-password", {
        token,
        password,
        repeatPassword,
      });
      setSuccess("Password updated. You can now log in.");
      setPassword("");
      setRepeatPassword("");
    } catch (error: unknown) {
      const requestError = error as AuthRequestError;
      setError(requestError.response?.data?.error ?? "Unable to reset password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <NavBar />
      <section className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Reset password
          </h2>

          {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}
          {success && <p className="mb-4 text-sm text-green-700">{success}</p>}

          {!confirmed && !success && (
            <Button
              type="button"
              color="primary"
              className="w-full"
              disabled={confirming}
              onPress={handleConfirm}
            >
              Continue password reset
            </Button>
          )}

          {confirmed && !success && (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div>
                <label
                  className="block text-gray-700 text-sm mb-2"
                  htmlFor="password"
                >
                  New password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 text-sm mb-2"
                  htmlFor="repeat-password"
                >
                  Repeat new password
                </label>
                <input
                  type="password"
                  id="repeat-password"
                  name="repeat-password"
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={repeatPassword}
                  onChange={(event) => setRepeatPassword(event.target.value)}
                />
              </div>
              <Button
                type="submit"
                color="primary"
                className="w-full"
                disabled={submitting}
              >
                Update password
              </Button>
            </form>
          )}

          {success && (
            <Button as={Link} href="/login" color="primary" className="w-full">
              Back to login
            </Button>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
