// app/billing/cancel/page.tsx (NEW FILE)
"use client";

import Nav from "@/components/Nav";
import { useRouter } from "next/navigation";

export default function BillingCancelPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <Nav />
      <section className="mx-auto max-w-2xl px-6 py-14">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur">
          <h1 className="text-2xl font-semibold text-slate-900">
            Checkout canceled
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            No worries — you can upgrade anytime.
          </p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => router.push("/pricing")}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Back to pricing
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Go to dashboard
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
