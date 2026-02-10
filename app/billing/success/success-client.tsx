"use client";

import Nav from "@/components/Nav";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type VerifyResponse = {
  ok?: boolean;
  is_paid?: boolean;
  detail?: string;
};

export default function SuccessClient() {
  const router = useRouter();

  const API = useMemo(() => {
    return (
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://doc-explainer-api.onrender.com"
    );
  }, []);

  const [msg, setMsg] = useState("Finalizing your subscription…");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // ✅ sessionIdRaw is string | null
    const qs = new URLSearchParams(window.location.search);
    const sessionIdRaw = qs.get("session_id");

    // ✅ hard guard so below is ALWAYS string
    if (!sessionIdRaw) {
      setMsg("Missing session id. Please contact support.");
      return;
    }

    // ✅ now sessionId is guaranteed string
    const sessionId: string = sessionIdRaw;

    let cancelled = false;

    async function verify() {
      try {
        setMsg("Confirming payment with Stripe…");

        const url = `${API}/billing/verify?session_id=${encodeURIComponent(
          sessionId
        )}`;

        const res = await fetch(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        let data: VerifyResponse = {};
        try {
          data = (await res.json()) as VerifyResponse;
        } catch {
          data = {};
        }

        if (!res.ok) {
          if (!cancelled) {
            setMsg(
              data?.detail ||
                "Could not verify payment yet. Please refresh in a moment."
            );
          }
          return;
        }

        if (!cancelled) {
          setMsg("✅ Payment confirmed. Redirecting to dashboard…");
          setTimeout(() => router.push("/dashboard"), 900);
        }
      } catch {
        if (!cancelled) setMsg("Network error verifying payment. Please refresh.");
      }
    }

    verify();

    return () => {
      cancelled = true;
    };
  }, [API, router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <Nav />
      <section className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur">
          <h1 className="text-2xl font-semibold text-slate-900">Success</h1>
          <p className="mt-2 text-sm text-slate-600">{msg}</p>

          <button
            className="mt-6 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            onClick={() => router.push("/dashboard")}
            type="button"
          >
            Go to dashboard
          </button>
        </div>
      </section>
    </main>
  );
}
