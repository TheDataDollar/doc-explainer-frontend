"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://doc-explainer-api.onrender.com";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { detail: text };
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    try {
      setRefCode(localStorage.getItem("affiliate_ref_code"));
    } catch {
      setRefCode(null);
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setLoading(false);
      setMsg("Please enter your email and password.");
      return;
    }

    let affiliateRef = "";
    try {
      affiliateRef = localStorage.getItem("affiliate_ref_code") || "";
    } catch {}

    try {
      // ✅ Register (includes affiliate_ref_code, backend attaches referral)
      const registerRes = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
          affiliate_ref_code: affiliateRef || undefined,
        }),
      });

      if (!registerRes.ok) {
        const err = await safeJson(registerRes);
        throw new Error(err?.detail || "Registration failed");
      }

      const regData = await safeJson(registerRes);
      const token = regData?.token;
      if (!token) throw new Error("No token returned from /auth/register");

      // store token (your app uses "token")
      try {
        localStorage.setItem("token", token);
      } catch {}

      // clear referral code after successful signup
      if (affiliateRef) {
        try {
          localStorage.removeItem("affiliate_ref_code");
        } catch {}
      }

      router.push("/dashboard");
    } catch (err: any) {
      setMsg(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
        <div className="absolute left-1/2 top-[-140px] h-[340px] w-[780px] -translate-x-1/2 rounded-full bg-slate-100 blur-3xl opacity-70" />
      </div>

      <div className="mx-auto max-w-lg px-6 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Create your account
          </h1>

          {refCode ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              Referral detected:{" "}
              <span className="font-mono font-bold">{refCode}</span>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              No referral code detected (normal signup).
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                placeholder="you@email.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                placeholder="••••••••"
              />
            </div>

            {msg && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                {msg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition",
                loading ? "opacity-70" : "hover:bg-slate-800"
              )}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
