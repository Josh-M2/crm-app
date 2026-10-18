import Link from "next/link";
import { FiArrowRight, FiLayers, FiMessageSquare } from "react-icons/fi";

export default function IntegrationSection() {
  return (
    <section className="bg-white px-5 py-24 sm:px-8 lg:py-28" aria-labelledby="integrations-title">
      <div className="mx-auto grid max-w-7xl items-center gap-10 rounded-[2rem] bg-slate-900 p-6 text-white sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:p-16">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">Integrations</p>
          <h2 id="integrations-title" className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Your tools shape what comes next.</h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">Direct integrations are still being developed. Tell us which tools your team relies on so we can prioritize the connections that matter.</p>
          <Link href="/contact" className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-sky-100">Request an integration <FiArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="grid min-w-0 gap-4" aria-hidden="true">
          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 sm:gap-4 sm:p-5"><span className="shrink-0 rounded-xl bg-sky-400/20 p-3 text-sky-300"><FiMessageSquare size={22} /></span><span className="min-w-0 font-semibold">Conversations</span><span className="ml-auto hidden h-px w-12 bg-sky-300/50 sm:block" /></div>
          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 sm:gap-4 sm:p-5"><span className="shrink-0 rounded-xl bg-indigo-400/20 p-3 text-indigo-300"><FiLayers size={22} /></span><span className="min-w-0 font-semibold">Customer data</span><span className="ml-auto hidden h-px w-12 bg-indigo-300/50 sm:block" /></div>
          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-indigo-300/30 bg-indigo-500/20 p-4 sm:gap-4 sm:p-5"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500 font-black">L</span><span className="min-w-0 font-semibold">LeadNest workspace</span></div>
        </div>
      </div>
    </section>
  );
}
