// app/billing/success/page.tsx (NEW FILE)
"use client";

import Nav from "@/components/Nav";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BillingSuccessPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Finalizing your subscription…");

  const API =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://doc-explainer-api.onrender.com";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    let tries = 0;
    const maxTries = 10;

    async function pollMe() {
      tries += 1;
      try {
        const res = await fetch(`${API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data?.is_paid) {
          setMsg("✅ Subscription active! Sending you to your dashboard…");
          setTimeout(() => router.push("/dashboard"), 800);
          return;
        }

        if (tries >= maxTries) {
          setMsg(
            "Payment received — syncing is taking a moment. Go to Dashboard and refresh in 10–20 seconds."
          );
          return;
        }

        setMsg("Payment received — syncing your account…");
        setTimeout(pollMe, 2000);
      } catch {
        if (tries >= maxTries) {
          setMsg("Payment received — please refresh your dashboard in a moment.");
          return;
        }
        setTimeout(pollMe, 2000);
      }
    }

    pollMe();
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <Nav />
      <section className="mx-auto max-w-2xl px-6 py-14">
        <div className="rounded-3xl border border-emerald-200 bg-white/80 p-8 shadow-sm backdrop-blur">
          <h1 className="text-2xl font-semibold text-slate-900">
            Billing Success
          </h1>
          <p className="mt-3 text-sm text-slate-600">{msg}</p>

          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Go to dashboard
          </button>
        </div>
      </section>
    </main>
  );
}
