"use client";

import { useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://doc-explainer-api.onrender.com";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      setDone(true);
      setMsg("If that email exists, we sent a reset link.");
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
            Forgot password
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter your email and we’ll send a password reset link.
          </p>

          <form onSubmit={onSubmit} className="mt-6">
            <label className="block text-sm font-semibold text-slate-800">
              Email
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              type="email"
              required
              autoCapitalize="none"
              autoCorrect="off"
              inputMode="email"
            />

            <button
              disabled={loading || done}
              className="mt-5 w-full rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Sending..." : done ? "Sent" : "Send reset link"}
            </button>
          </form>

          <div className="mt-4 text-sm text-slate-600">
            Remembered your password?{" "}
            <a href="/login" className="font-semibold text-emerald-700 hover:underline">
              Back to login
            </a>
          </div>

          {msg ? (
            <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {msg}
            </div>
          ) : null}

          <div className="mt-6 text-xs text-slate-500">
            For security, we don’t confirm whether an email exists.
          </div>
        </div>
      </section>
    </main>
  );
}
