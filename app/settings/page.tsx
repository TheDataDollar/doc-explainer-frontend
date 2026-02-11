// app/settings/page.tsx (FULL COPY / REPLACE)
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

function Card({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          ) : null}
        </div>
        {right}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
      {children}
    </span>
  );
}

export default function SettingsPage() {
  const router = useRouter();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password change
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNext, setPwNext] = useState("");
  const [pwNext2, setPwNext2] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);

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

  async function changePassword() {
    setPwMsg(null);

    if (!pwCurrent || !pwNext || !pwNext2) {
      setPwMsg("Fill out all fields.");
      return;
    }
    if (pwNext.length < 8) {
      setPwMsg("New password must be at least 8 characters.");
      return;
    }
    if (pwNext !== pwNext2) {
      setPwMsg("New passwords do not match.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      setPwBusy(true);

      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: pwCurrent,
          new_password: pwNext,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setPwMsg(data?.detail || "Could not change password.");
        return;
      }

      setPwCurrent("");
      setPwNext("");
      setPwNext2("");
      setPwMsg("Password updated.");
    } catch {
      setPwMsg("Network error. Try again.");
    } finally {
      setPwBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <main className="relative min-h-screen">
      {/* soft background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/35 to-white" />
        <div className="absolute left-1/2 top-[-140px] h-[340px] w-[820px] -translate-x-1/2 rounded-full bg-slate-100 blur-3xl opacity-70" />
      </div>

      <Nav />

      <section className="mx-auto max-w-5xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Settings
              </h1>
              {!loading && !error && me ? <Pill>{tierLabel}</Pill> : null}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Account, security, and billing — neatly organized.
            </p>
          </div>

          <button
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            onClick={() => router.push("/dashboard")}
          >
            Back to dashboard
          </button>
        </div>

        {/* States */}
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
            {/* Layout */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {/* Account */}
              <Card
                title="Account"
                subtitle="Your email, plan, and usage."
              >
                <div className="space-y-3">
                  <Row label="Email" value={me?.email ?? "—"} />
                  <Row label="Plan" value={tierLabel} />
                  {!me?.is_paid ? (
                    <Row
                      label="Free usage"
                      value={`${me?.free_docs_used ?? 0}/3`}
                    />
                  ) : null}
                </div>

                {!me?.is_paid ? (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Upgrade to unlock unlimited documents + drafting.
                  </div>
                ) : null}
              </Card>

              {/* Billing */}
              <Card
                title="Plan & billing"
                subtitle="Upgrade, cancel, or update your payment method."
              >
                <div className="flex flex-col gap-3 sm:flex-row">
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
              </Card>

              {/* Security */}
              <Card
                title="Security"
                subtitle="Change your password."
                right={<Pill>Optional</Pill>}
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">
                      Current password
                    </label>
                    <input
                      value={pwCurrent}
                      onChange={(e) => setPwCurrent(e.target.value)}
                      type="password"
                      autoComplete="current-password"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">
                        New password
                      </label>
                      <input
                        value={pwNext}
                        onChange={(e) => setPwNext(e.target.value)}
                        type="password"
                        autoComplete="new-password"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                        placeholder="At least 8 characters"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700">
                        Confirm new password
                      </label>
                      <input
                        value={pwNext2}
                        onChange={(e) => setPwNext2(e.target.value)}
                        type="password"
                        autoComplete="new-password"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                        placeholder="Repeat new password"
                      />
                    </div>
                  </div>

                  {pwMsg ? (
                    <div
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-sm",
                        pwMsg === "Password updated."
                          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                          : "border-rose-200 bg-rose-50 text-rose-900"
                      )}
                    >
                      {pwMsg}
                    </div>
                  ) : null}

                  <button
                    className={cn(
                      "w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800",
                      pwBusy && "opacity-60 cursor-not-allowed"
                    )}
                    onClick={changePassword}
                    disabled={pwBusy}
                  >
                    {pwBusy ? "Updating…" : "Update password"}
                  </button>

                  <p className="text-xs text-slate-500">
                    This expects backend endpoint{" "}
                    <span className="font-mono">POST /auth/change-password</span>.
                  </p>
                </div>
              </Card>

              {/* Sign out */}
              <Card
                title="Sign out"
                subtitle="Log out of this device."
              >
                <button
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                  onClick={logout}
                >
                  Log out
                </button>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                  If you’re on a shared device, sign out when you’re done.
                </div>
              </Card>
            </div>

            {/* Footer spacing */}
            <div className="mt-10 text-center text-xs text-slate-400">
              Document Explainer • Settings
            </div>
          </>
        )}
      </section>
    </main>
  );
}
