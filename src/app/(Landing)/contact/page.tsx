"use client";

import { useState, type FormEvent } from "react";
import { FiArrowRight, FiMail } from "react-icons/fi";
import NavBar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function ContactUsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website }),
      });
      const result = await response.json();

      if (!response.ok) {
        setFeedback({ type: "error", text: result.error || "Unable to send your message. Please try again." });
        return;
      }

      setFeedback({ type: "success", text: "Message sent. Thanks for reaching out!" });
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setFeedback({ type: "error", text: "Unable to send your message. Please try again." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <NavBar />
      <main className="bg-[#f7f9ff] px-5 pb-24 pt-36 sm:px-8 lg:pb-32 lg:pt-44">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="max-w-lg">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600"><FiMail size={24} aria-hidden="true" /></span>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Contact LeadNest</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Let&apos;s talk about your team.</h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">Questions about LeadNest, pricing, or the tools you want connected? Send a note and we&apos;ll get back to you.</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_25px_70px_-35px_rgba(25,40,75,0.28)] sm:p-9">
            <h2 className="text-xl font-bold text-slate-900">Send a message</h2>
            <p className="mt-1 text-sm text-slate-500">Tell us a little about what you need.</p>
            {feedback && <p role="status" className={`mt-6 rounded-xl border px-4 py-3 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{feedback.text}</p>}
            <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold text-slate-700">Name</label>
                <input id="contact-name" name="name" type="text" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold text-slate-700">Message</label>
                <textarea id="contact-message" name="message" required minLength={10} maxLength={5000} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="What would you like to know?" className="min-h-40 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none" />
              </div>
              <div className="hidden" aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></div>
              <button type="submit" disabled={isSending} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">
                {isSending ? "Sending..." : "Send message"} {!isSending && <FiArrowRight aria-hidden="true" />}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
