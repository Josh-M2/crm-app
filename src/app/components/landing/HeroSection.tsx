import Link from "next/link";
import { FiArrowRight, FiCheck, FiTarget, FiUsers } from "react-icons/fi";

const stages = [
  { label: "New lead", detail: "Capture interest", color: "bg-sky-400" },
  { label: "Qualified", detail: "Assign the next step", color: "bg-indigo-500" },
  { label: "Deal in motion", detail: "Move toward close", color: "bg-emerald-500" },
];

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f7f9ff] px-5 pb-24 pt-36 sm:px-8 lg:pb-32 lg:pt-44">
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-48 -z-10 h-[38rem] w-[38rem] rounded-full bg-indigo-100/80 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-44 -left-40 -z-10 h-[35rem] w-[35rem] rounded-full bg-sky-100/80 blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.96fr)] lg:gap-12">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-indigo-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-indigo-500" /> A clearer way to manage your pipeline
          </p>
          <h1 className="mt-7 text-5xl font-bold leading-[1.08] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[4.5rem]">
            Every lead deserves a <span className="text-indigo-600">next step.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
            Keep leads, deals, and team activity in one organized workspace. See what needs attention and move opportunities forward with confidence.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/signup" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-200 transition-colors hover:bg-indigo-700">
              Get started <FiArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="#Features" className="inline-flex min-h-12 items-center rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-white hover:text-indigo-700">Explore features</Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
            <span className="inline-flex items-center gap-2"><FiCheck className="text-emerald-600" aria-hidden="true" /> Organize leads</span>
            <span className="inline-flex items-center gap-2"><FiCheck className="text-emerald-600" aria-hidden="true" /> Track deals</span>
            <span className="inline-flex items-center gap-2"><FiCheck className="text-emerald-600" aria-hidden="true" /> Work together</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl" aria-label="Illustration of the LeadNest workflow">
          <div aria-hidden="true" className="absolute inset-x-10 -bottom-5 top-10 -z-10 rounded-[2rem] bg-indigo-200/60 blur-3xl" />
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_35px_90px_-35px_rgba(28,45,94,0.38)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-black text-white">L</span>
                <span className="font-bold text-slate-900">LeadNest</span>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Workflow preview</span>
            </div>
            <div className="bg-[#f8faff] p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Pipeline</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">Stay on top of every step</h2>
                </div>
                <span className="rounded-xl bg-white p-2.5 text-indigo-600 shadow-sm"><FiTarget size={20} aria-hidden="true" /></span>
              </div>
              <div className="mt-6 space-y-3">
                {stages.map((stage, index) => (
                  <div key={stage.label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm sm:px-5">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${stage.color}`}>{index + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-slate-900">{stage.label}</span>
                      <span className="block text-xs text-slate-500">{stage.detail}</span>
                    </span>
                    <FiArrowRight className="shrink-0 text-slate-300" aria-hidden="true" />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-800">
                <FiUsers className="shrink-0" size={18} aria-hidden="true" /> One shared view for your whole team
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
