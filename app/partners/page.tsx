import Link from "next/link";

export default function PartnersPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      {/* Back to home */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline"
        >
          ← Back to home
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            Partner Program
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Partner with Real Estate Explainer
          </h1>

          <p className="mt-4 max-w-xl text-base text-slate-600">
            Help clients understand real estate documents faster with clear
            summaries, key dates, and attention flags — and earn recurring
            commissions for referrals.
          </p>

          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-600" />
              Recurring commissions on active subscriptions
            </li>
            <li className="flex gap-3">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-600" />
              Simple tracking dashboard (clicks, signups, earnings)
            </li>
            <li className="flex gap-3">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-600" />
              Built for brokers, agents, investors, and service providers
            </li>
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/partners/signup"
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Apply to Become a Partner
            </Link>

            <Link
              href="/partners/login"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              Partner Login
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Applications may be reviewed before approval. This program is for
            referrals only — no promise of earnings.
          </p>
        </div>

        {/* Right */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">
            What partners get
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-900">
                Unique referral link
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Share a branded link that tracks referrals.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-900">
                Tracking dashboard
              </div>
              <div className="mt-1 text-sm text-slate-600">
                View clicks, signups, and earnings in one place.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-900">
                Marketing assets
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Copy + banners + examples (coming soon).
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-900">
                Transparent payouts
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Clear status for pending vs paid (V1 = manual payouts).
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="text-xs font-semibold text-emerald-900">
              Early partners
            </div>
            <div className="mt-1 text-sm text-emerald-900/90">
              Early partners may receive a higher commission rate for an initial
              period.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
