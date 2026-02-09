"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://doc-explainer-api.onrender.com";

export default function ResetPasswordClient() {
  const params = useSearchParams();
  const router = useRouter();

  const token = useMemo(() => params.get("token") || "", [params]);

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const tokenMissing = !token;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!token) return setMsg("❌ Missing token. Please use the link from your email.");
    if (pw.length < 8) return setMsg("❌ Password must be at least 8 characters.");
    if (pw !== pw2) return setMsg("❌ Passwords do not match.");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: pw }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMsg(`❌ ${data?.detail || "Reset failed."}`);
        return;
      }

      setMsg("✅ Password reset! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1200);
    } catch (err: any) {
      setMsg(`❌ Network error: ${err?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <section className="mx-auto max-w-md px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
          <h1 className="text-2xl font-semibold text-slate-900">
            Reset password
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Choose a new password for your account.
          </p>

          {tokenMissing ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Missing token. Please open the reset link from your email.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6">
              <label className="block text-sm font-semibold text-slate-800">
                New password
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                type="password"
                required
                placeholder="At least 8 characters"
              />

              <label className="mt-4 block text-sm font-semibold text-slate-800">
                Confirm password
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                type="password"
                required
                placeholder="Repeat password"
              />

              <button
                disabled={loading}
                className="mt-5 w-full rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>
          )}

          <div className="mt-4 text-sm text-slate-600">
            <a href="/login" className="font-semibold text-emerald-700 hover:underline">
              Back to login
            </a>
          </div>

          {msg ? (
            <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {msg}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
