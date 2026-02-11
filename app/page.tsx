// app/page.tsx (FULL COPY / REPLACE)
import Link from "next/link";
import Nav from "@/components/Nav";

function Icon({
  name,
  className,
}: {
  name: "check" | "bolt" | "shield" | "home";
  className?: string;
}) {
  const cls = className || "h-5 w-5";
  switch (name) {
    case "check":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "bolt":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M13 2L3 14h7l-1 8 12-14h-7l-1-6z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "shield":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "home":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V10.5z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Nav />

      {/* HERO WRAP (full-bleed feel) */}
      <section className="relative overflow-hidden">
        {/* background */}
        <div className="pointer-events-none absolute inset-0">
          {/* soft gradients */}
          <div className="absolute -top-40 left-1/2 h-[520px] w-[980px] -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute -bottom-48 right-[-160px] h-[520px] w-[520px] rounded-full bg-sky-200/40 blur-3xl" />
          <div className="absolute -bottom-40 left-[-160px] h-[520px] w-[520px] rounded-full bg-slate-200/50 blur-3xl" />

          {/* subtle grid */}
          <div className="absolute inset-0 opacity-[0.08] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]">
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgb(15 23 42) 1px, transparent 1px), linear-gradient(to bottom, rgb(15 23 42) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
              }}
            />
          </div>

          {/* top fade to connect header */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white to-transparent" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-10 sm:pt-12 md:pt-16">
          {/* glass hero card */}
          <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/75 shadow-[0_20px_80px_-50px_rgba(2,6,23,0.35)] backdrop-blur">
            {/* inner glow edges */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-emerald-200/55 blur-3xl" />
              <div className="absolute -right-28 -bottom-28 h-80 w-80 rounded-full bg-sky-200/45 blur-3xl" />
            </div>

            <div className="relative grid gap-10 p-7 sm:p-10 md:grid-cols-2 md:items-center">
              {/* Left copy */}
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-widest text-emerald-700">
                  REAL ESTATE DOCUMENT CLARITY
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600" />
                </div>

                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                  Understand your lease, HOA rules, or closing documents — fast.
                </h1>

                <p className="mt-4 mx-auto max-w-xl text-base text-slate-600 sm:text-lg md:mx-0">
                  Upload a real estate document and get a clear breakdown:{" "}
                  <span className="font-semibold text-slate-900">
                    fees, deadlines, red flags
                  </span>{" "}
                  — plus what questions to ask before you sign.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
                  <Link
                    href="/register"
                    className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                  >
                    Try free (3 docs)
                  </Link>

                  <Link
                    href="/pricing"
                    className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                  >
                    View pricing
                  </Link>
                </div>

                {/* feature bullets */}
                <div className="mt-7 grid gap-4 text-left text-sm text-slate-700">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                      <Icon name="check" className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Plain-English explanation
                      </p>
                      <p className="text-slate-600">
                        No legal jargon — just clarity.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                      <Icon name="bolt" className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Fees & deadlines highlighted
                      </p>
                      <p className="text-slate-600">
                        Know what could cost you money or time.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                      <Icon name="shield" className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Optional human review workflow
                      </p>
                      <p className="text-slate-600">
                        Perfect for “I’m not sure” moments.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right demo */}
              <div className="relative">
                <div className="rounded-[22px] border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Quick real estate breakdown
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Lease • HOA • Closing disclosure • Addendum
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                        Live preview
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-slate-700">
                          Upload
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-700">
                          PDF
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center">
                        <p className="text-sm font-medium text-slate-800">
                          Drag & drop a PDF here
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          or tap to select a file
                        </p>
                      </div>

                      <button className="mt-4 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
                        Explain document
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-xs font-semibold text-slate-700">
                          You’ll get
                        </div>
                        <ul className="mt-2 space-y-2 text-sm text-slate-700">
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                            Summary in plain English
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                            Fees, penalties, renewals
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                            Deadlines + action checklist
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                            Red flags to review
                          </li>
                        </ul>
                      </div>

                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs text-emerald-900">
                        <span className="font-semibold">Free:</span> 3 uploads •{" "}
                        <span className="font-semibold">Pro:</span> unlimited
                      </div>
                    </div>
                  </div>
                </div>

                {/* little floating accent */}
                <div className="pointer-events-none absolute -right-4 -top-4 hidden h-20 w-20 rounded-3xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur md:block" />
              </div>
            </div>
          </div>

          {/* Trust strip */}
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white/75 p-6 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900">
                  <Icon name="home" className="h-5 w-5" />
                </span>
                <p className="text-sm font-semibold text-slate-900">
                  Lease clarity
                </p>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Understand renewals, deposits, fees, and move-out requirements.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/75 p-6 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900">
                  <Icon name="shield" className="h-5 w-5" />
                </span>
                <p className="text-sm font-semibold text-slate-900">HOA rules</p>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Know restrictions, approvals, fines, and common “gotchas.”
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/75 p-6 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900">
                  <Icon name="bolt" className="h-5 w-5" />
                </span>
                <p className="text-sm font-semibold text-slate-900">
                  Closing docs
                </p>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Track timelines, obligations, and what to ask your agent/lender.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
