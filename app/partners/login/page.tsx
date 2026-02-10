import Link from "next/link";

export default function PartnerLoginPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-14">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">
          Partner Login
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Log in to view your referral link and performance.
        </p>

        <div className="mt-6 space-y-3">
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
              placeholder="••••••••"
            />
          </div>

          <button
            className="mt-2 w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            type="button"
          >
            Sign in (wiring next)
          </button>

          <div className="text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/partners/signup" className="font-semibold text-slate-900 hover:underline">
              Apply here
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
