import Link from "next/link";

export default function PartnerSignupPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-14">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">
          Apply to Become a Partner
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Create your partner account. You may be pending approval before you
          can access the dashboard.
        </p>

        <div className="mt-6 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Display name
            </label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-300"
              placeholder="Your name or brand"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Email</label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-300"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">
              Password
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-300"
              placeholder="Create a password"
            />
          </div>

          <button
            className="mt-2 w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            type="button"
          >
            Submit application (wiring next)
          </button>

          <div className="text-center text-xs text-slate-500">
            Already have a partner account?{" "}
            <Link href="/partners/login" className="font-semibold text-slate-900 hover:underline">
              Login
            </Link>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          By applying, you agree to follow our partner terms and represent the
          product honestly.
        </p>
      </div>
    </main>
  );
}
