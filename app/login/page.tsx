// app/login/page.tsx (FULL COPY / REPLACE)
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function normalizeBase(url: string) {
  return url.replace(/\/+$/, "");
}

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function LoginPage() {
  const router = useRouter();

  const API_BASE = useMemo(() => {
    const raw =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://doc-explainer-api.onrender.com";
    return normalizeBase(raw);
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem("token");
      if (t) router.push("/dashboard");
    } catch {
      // ignore
    }
  }, [router]);

  function persistToken(token: string) {
    try {
      localStorage.setItem("token", token);
    } catch {
      // ignore
    }
  }

  async function safeReadError(res: Response) {
    const text = await res.text().catch(() => "");
    try {
      const json = JSON.parse(text);
      return json?.detail || json?.message || text || "Login failed";
    } catch {
      return text || "Login failed";
    }
  }

  async function doLogin() {
    setLoading(true);
    setMsg("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      if (!res.ok) {
        const reason = await safeReadError(res);
        setMsg(`❌ ${reason}`);
        setLoading(false);
        return;
      }

      const data = await res.json().catch(() => null);
      const token = data?.token;

      if (!token) {
        setMsg("❌ Login succeeded but no token returned.");
        setLoading(false);
        return;
      }

      persistToken(token);
      router.push("/dashboard");
    } catch (e: any) {
      setMsg(`❌ Network error: ${e?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-emerald-50/30 to-white">
      {/* Soft “cool” background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.10),transparent_55%)]" />
        <div className="absolute left-1/2 top-[-160px] h-[360px] w-[900px] -translate-x-1/2 rounded-full bg-slate-100 blur-3xl opacity-70" />
        <div className="absolute right-[-120px] top-[120px] h-[260px] w-[260px] rounded-full bg-emerald-100 blur-3xl opacity-60" />
        <div className="absolute left-[-120px] bottom-[120px] h-[260px] w-[260px] rounded-full bg-slate-100 blur-3xl opacity-70" />
      </div>

      <section className="mx-auto max-w-5xl px-6 py-10">
        {/* Top back button (sits like a header chip) */}
        <div className="mb-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur hover:bg-white"
          >
            <span className="text-emerald-700">←</span> Back to home
          </a>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
          {/* LEFT */}
          <div className="order-2 md:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
              Secure login • Private by default
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900">
              Welcome back
            </h1>

            <p className="mt-3 max-w-lg text-base text-slate-600">
              Log in to view your documents, reviews, and next steps before you
              sign.
            </p>

            {/* Cool “status” card */}
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white/75 p-5 shadow-sm backdrop-blur">
              <div className="text-sm font-semibold text-slate-900">
                What you can do after login
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Upload and review documents in seconds
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Track your history and saved notes
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Manage your plan and billing anytime
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT */}
          <div className="order-1 md:order-2">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!loading) doLogin();
                }}
              >
                <label className="block text-sm font-semibold text-slate-800">
                  Email
                </label>
                <input
                  className={cn(
                    "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none",
                    "focus:border-slate-400 focus:ring-4 focus:ring-emerald-100"
                  )}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="email"
                  inputMode="email"
                />

                <label className="mt-4 block text-sm font-semibold text-slate-800">
                  Password
                </label>
                <input
                  className={cn(
                    "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none",
                    "focus:border-slate-400 focus:ring-4 focus:ring-emerald-100"
                  )}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />

                <div className="mt-3 flex items-center justify-between">
                  <a
                    href="/forgot-password"
                    className="text-sm font-semibold text-emerald-700 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-5 w-full rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              {msg && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  {msg}
                </div>
              )}

              <div className="mt-6 text-center text-sm text-slate-600">
                Don’t have an account?{" "}
                <a
                  href="/register"
                  className="font-semibold text-emerald-700 hover:underline"
                >
                  Create one
                </a>
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-slate-500">
              API: <span className="font-mono">{API_BASE}</span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
