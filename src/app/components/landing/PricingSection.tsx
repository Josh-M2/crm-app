import Link from "next/link";
import { FiArrowRight, FiCheckCircle, FiMessageCircle } from "react-icons/fi";

export default function PricingSection() {
  return (
    <section className="bg-[#f7f9ff] px-5 py-24 sm:px-8 lg:py-28" aria-labelledby="pricing-title">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Pricing</p>
          <h2 id="pricing-title" className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Start building a clearer pipeline</h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">Pricing details are not available yet. You can explore the current workspace and reach out if your team has specific needs.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-indigo-200 bg-white p-8 shadow-[0_18px_55px_-30px_rgba(67,56,202,0.35)]">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><FiCheckCircle size={23} aria-hidden="true" /></span>
            <h3 className="mt-6 text-2xl font-bold text-slate-900">Explore LeadNest</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">Create an account and see how leads, deals, and team activity fit together.</p>
            <Link href="/signup" className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700">Get started <FiArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_18px_55px_-30px_rgba(25,40,75,0.2)]">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><FiMessageCircle size={23} aria-hidden="true" /></span>
            <h3 className="mt-6 text-2xl font-bold text-slate-900">Have a team question?</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">Tell us about your workflow and the features or pricing information you need.</p>
            <Link href="/contact" className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800 transition-colors hover:border-indigo-300 hover:text-indigo-700">Contact us <FiArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
