"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const API_BASE = useMemo(() => {
    return (
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://doc-explainer-api.onrender.com"
    );
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

  async function login() {
    setLoading(true);
    setMsg("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password; // don't trim passwords (spaces can be valid)

    if (!cleanEmail || !cleanPassword) {
      setMsg("❌ Please enter your email and password.");
      setLoading(false);
      return;
    }

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
      const detail = e?.message || "Unknown error";

      // Helpful message for the most common mobile issue
      setMsg(
        `❌ Network error: ${detail}\n\n` +
          `If you're on mobile, this is usually an API URL/env or CORS issue.\n` +
          `API_BASE currently: ${API_BASE}`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-2 md:items-center">
        {/* LEFT: Marketing */}
        <div className="order-2 md:order-1">
          <a
            href="/"
            className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:underline"
          >
            ← Back to home
          </a>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900">
            Welcome back
          </h1>

          <p className="mt-4 max-w-lg text-base text-slate-600">
            Log in to view your documents, reviews, and next steps before you
            sign.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-700">
            Secure access • Your documents stay private
          </div>
        </div>

        {/* RIGHT: Login card */}
        <div className="order-1 md:order-2">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!loading) login();
              }}
            >
              <label className="block text-sm font-semibold text-slate-800">
                Email
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoCapitalize="none"
                autoCorrect="off"
                inputMode="email"
                autoComplete="email"
              />

              <label className="mt-4 block text-sm font-semibold text-slate-800">
                Password
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100"
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

              {msg && (
                <div className="mt-4 whitespace-pre-line rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
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
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
