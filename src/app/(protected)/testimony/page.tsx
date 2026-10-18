"use client";

import SetUpOrg from "@/app/components/SetUpOrg";
import { FormSkeleton } from "@/app/components/ProtectedPageSkeleton";
import { useOrganization } from "@/app/context/OrganizationContext";
import { Button, Card, Input, Textarea } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function TestimonyPage() {
  const { data: session } = useSession();
  const { selectedOrg, isLoading } = useOrganization();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, rating }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Unable to submit your story.");
        return;
      }

      setTitle("");
      setMessage("");
      setRating(5);
      setStatusMessage("Your story has been published.");
    } catch {
      setErrorMessage("Unable to submit your story. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {!session || !session.user?.email || isLoading ? (
        <FormSkeleton />
      ) : selectedOrg ? (
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-8">
            <p className="workspace-kicker mb-2">Community / Your story</p>
            <h1 className="workspace-heading">
              Share your LeadNest story
            </h1>
            <p className="workspace-subtitle mt-2">
              Tell other teams how LeadNest helps with your customer work.
            </p>
          </div>

          <Card className="workspace-panel p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                isRequired
                label="Role or company"
                maxLength={120}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Sales Lead at John Doe group"
              />

              <Textarea
                isRequired
                label="Your story"
                maxLength={600}
                minLength={20}
                minRows={6}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Share what improved after using LeadNest."
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Rating
                </label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, index) => {
                    const starValue = index + 1;
                    const active = starValue <= rating;

                    return (
                      <button
                        key={starValue}
                        type="button"
                        onClick={() => setRating(starValue)}
                        aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
                        aria-pressed={active}
                        className="rounded p-1 transition-transform hover:scale-110 focus:ring-blue-500"
                      >
                        <span
                          className={`text-3xl ${
                            active ? "text-yellow-400" : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      </button>
                    );
                  })}
                  <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
                </div>
              </div>

              {errorMessage && (
                <p role="alert" className="text-sm text-red-600">{errorMessage}</p>
              )}

              {statusMessage && (
                <p role="status" className="text-sm text-green-700">{statusMessage}</p>
              )}

              <div className="flex justify-end">
                <Button color="primary" className="rounded-xl px-5 font-semibold" isLoading={isSubmitting} type="submit">
                  Submit story
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : (
        <SetUpOrg />
      )}
    </>
  );
}
