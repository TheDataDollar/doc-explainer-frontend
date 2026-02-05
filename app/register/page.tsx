"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      !!email.trim() &&
      !!password.trim() &&
      password.trim().length >= 6 &&
      acceptedTerms &&
      !loading
    );
  }, [email, password, acceptedTerms, loading]);

  async function handleRegister() {
    setError(null);

    const e = email.trim();
    const p = password.trim();

    if (!e) {
      setError("Please enter your email.");
      return;
    }
    if (!p) {
      setError("Please enter a password.");
      return;
    }
    if (p.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!acceptedTerms) {
      setError("Please accept the Terms and Privacy Policy to continue.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: e, password: p }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Registration failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-indigo-50 to-white">
      {/* Top Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-indigo-600" />
          <span className="font-semibold text-slate-900">
            Document Explainer
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-slate-700 hover:text-slate-900"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Register Card */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur">
          {/* window dots */}
          <div className="mb-5 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-400" />
            <span className="h-3 w-3 rounded-full bg-amber-300" />
            <span className="h-3 w-3 rounded-full bg-emerald-300" />
          </div>

          <h1 className="text-2xl font-semibold text-slate-900">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Start free — 3 document explanations included.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Email
              </label>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Password
              </label>
              <input
                type="password"
                placeholder="Password (6+ characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
              />
              <p className="mt-2 text-xs text-slate-500">
                Tip: use 8+ characters for stronger security.
              </p>
            </div>

            {/* ✅ Terms checkbox */}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 accent-indigo-600"
              />
              <div className="text-sm text-slate-700">
                I agree to the{" "}
                <Link href="/terms" className="text-indigo-600 hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-indigo-600 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
                <div className="mt-1 text-xs text-slate-500">
                  Real Estate Explainer provides non-legal summaries and
                  highlights for clarity — not legal advice.
                </div>
              </div>
            </label>

            <button
              onClick={handleRegister}
              disabled={!canSubmit}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>

            {error && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                ❌ {error}
              </p>
            )}

            <p className="pt-2 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 hover:underline">
                Log in
              </Link>
            </p>

            <p className="text-center text-xs text-slate-500">
              By creating an account you confirm you’re authorized to upload the
              documents you provide.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
