"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Nav from "../../components/Nav";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Login failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setMessage(err?.message ? `❌ ${err.message}` : "❌ Failed to login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/50 to-white">
      <Nav />

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* Left: value prop */}
          <div>
            <p className="text-xs font-semibold tracking-widest text-emerald-700">
              REAL ESTATE EXPLAINER
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Welcome back.
            </h1>

            <p className="mt-4 max-w-xl text-base text-slate-600 md:text-lg">
              Log in to review leases, HOA rules, addendums, and closing docs in
              plain English — with highlighted fees, deadlines, and red flags
              (non-legal).
            </p>

            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Tip</p>
              <p className="mt-1 text-slate-600">
                Pros use this to quickly identify renewal dates, penalties, and
                responsibilities before sending docs to tenants/clients.
              </p>
            </div>
          </div>

          {/* Right: login card */}
          <div className="md:justify-self-end">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                  <span className="text-sm font-bold">RE</span>
                </div>
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    Log in
                  </div>
                  <div className="text-sm text-slate-500">
                    Access your dashboard & uploads
                  </div>
                </div>
              </div>

              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                {/* Email */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                {/* Row: remember + forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                    />
                    Remember me
                  </label>

                  <Link
                    href="/support"
                    className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Message */}
                {message && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {message}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Logging in..." : "Log in"}
                </button>

                <p className="text-center text-sm text-slate-600">
                  New here?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-slate-900 hover:underline"
                  >
                    Create an account
                  </Link>
                </p>

                <p className="text-center text-xs text-slate-500">
                  Not legal advice. We highlight common attention areas to help
                  you review faster.
                </p>
              </form>
            </div>

            {/* tiny trust row */}
            <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                Secure login
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                Fast summaries
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                Real estate focused
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
