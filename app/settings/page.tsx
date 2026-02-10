// app/settings/page.tsx
"use client";

import Nav from "@/components/Nav";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MeResponse = {
  user_id: number;
  email: string;
  free_docs_used: number;
  is_paid: boolean;
  plan_tier?: "free" | "pro" | "business";
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function SettingsPage() {
  const router = useRouter();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load account");
        const data: MeResponse = await res.json();

        if (cancelled) return;
        setMe(data);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const tierLabel = useMemo(() => {
    if (!me) return "—";
    if (me.plan_tier === "business") return "Business";
    if (me.plan_tier === "pro") return "Pro";
    if (me.is_paid) return "Paid";
    return "Free";
  }, [me]);

  async function openBillingPortal() {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      setBusy(true);
      const res = await fetch(`${API_BASE}/billing/portal`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.detail || "Could not open billing portal");
        return;
      }

      if (data?.url) window.location.href = data.url;
      else alert("Billing portal unavailable. Please contact support.");
    } catch {
      alert("Network error opening billing portal. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <Nav />

      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Settings
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage your account, plan, and billing.
            </p>
          </div>

          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            onClick={() => router.push("/dashboard")}
          >
            Back to dashboard
          </button>
        </div>

        {loading ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur text-sm text-slate-600">
            Loading settings…
          </div>
        ) : error ? (
          <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
            {error}
          </div>
        ) : (
          <>
            {/* Account card */}
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-900">Account</h2>

              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-600">Email</span>
                  <span className="font-medium">{me?.email ?? "—"}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-600">Plan</span>
                  <span className="font-medium">{tierLabel}</span>
                </div>

                {!me?.is_paid ? (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-600">Free usage</span>
                    <span className="font-medium">{me?.free_docs_used ?? 0}/3</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Billing card */}
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-900">
                Plan & billing
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Upgrade, cancel, or update your payment method.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                {!me?.is_paid ? (
                  <button
                    className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                    onClick={() => router.push("/pricing")}
                  >
                    Upgrade plan
                  </button>
                ) : (
                  <button
                    className={cn(
                      "flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800",
                      busy && "opacity-60 cursor-not-allowed"
                    )}
                    onClick={openBillingPortal}
                    disabled={busy}
                  >
                    {busy ? "Opening billing…" : "Manage billing"}
                  </button>
                )}

                <button
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                  onClick={() => router.push("/support")}
                >
                  Contact support
                </button>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Billing changes are handled securely through Stripe.
              </p>
            </div>

            {/* Danger zone */}
            <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50/60 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-rose-900">Danger zone</h2>
              <p className="mt-1 text-sm text-rose-800">
                Sign out of this device.
              </p>

              <button
                className="mt-4 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
                onClick={logout}
              >
                Log out
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
