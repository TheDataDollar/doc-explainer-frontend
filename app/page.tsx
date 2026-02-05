import Link from "next/link";
import Nav from "../components/Nav";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <Nav />

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-10 shadow-sm backdrop-blur">
          {/* soft glows */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/60 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />

          <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
            {/* Left copy */}
            <div>
              <p className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-widest text-emerald-700">
                REAL ESTATE DOCUMENT CLARITY
              </p>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                Understand your lease, HOA rules, or closing documents — fast.
              </h1>

              <p className="mt-4 max-w-xl text-base text-slate-600 md:text-lg">
                Upload a real estate document and get a clear breakdown:
                <span className="font-semibold text-slate-900">
                  {" "}
                  fees, deadlines, red flags
                </span>
                , and what questions to ask before you sign.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
                >
                  Try free (3 docs)
                </Link>

                <Link
                  href="/pricing"
                  className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  View pricing
                </Link>
              </div>

              <div className="mt-7 grid gap-3 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
                  <div>
                    <p className="font-medium text-slate-900">Plain-English explanation</p>
                    <p className="text-slate-600">No legal jargon — just clarity.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
                  <div>
                    <p className="font-medium text-slate-900">Fees & deadlines highlighted</p>
                    <p className="text-slate-600">Know what could cost you money or time.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
                  <div>
                    <p className="font-medium text-slate-900">Optional human review workflow</p>
                    <p className="text-slate-600">Perfect for “I’m not sure” moments.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right card mock */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Quick real estate breakdown
                  </p>
                  <p className="text-sm text-slate-500">
                    Lease • HOA • Closing disclosure • Addendum
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                  Demo
                </span>
              </div>

              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-700">
                  Drag & drop a PDF here, or click to upload
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  (We’ll connect this to upload next.)
                </p>
              </div>

              <button className="mt-5 w-full rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white hover:bg-emerald-700">
                Explain document
              </button>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm">
                <p className="font-semibold text-slate-900">You’ll get:</p>
                <ul className="mt-2 space-y-2 text-slate-600">
                  <li>• What this document means</li>
                  <li>• Fees, penalties, renewals</li>
                  <li>• Deadlines & action checklist</li>
                  <li>• Red flags to review</li>
                </ul>
              </div>

              <p className="mt-3 text-center text-xs text-slate-500">
                Free users get 3 uploads. Pro users get unlimited.
              </p>
            </div>
          </div>
        </div>

        {/* bottom trust strip */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Lease clarity</p>
            <p className="mt-2 text-sm text-slate-600">
              Understand renewals, deposits, fees, and move-out requirements.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">HOA rules</p>
            <p className="mt-2 text-sm text-slate-600">
              Know restrictions, approvals, fines, and common “gotchas.”
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Closing docs</p>
            <p className="mt-2 text-sm text-slate-600">
              Track timelines, obligations, and what to ask your agent/lender.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
