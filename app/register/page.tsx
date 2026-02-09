"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://doc-explainer-api.onrender.com";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [msg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem("token");
      if (t) router.push("/dashboard");
    } catch {}
  }, [router]);

  function persistToken(token: string) {
    try {
      localStorage.setItem("token", token);
    } catch {}
  }

  async function safeReadError(res: Response) {
    const text = await res.text().catch(() => "");
    try {
      const json = JSON.parse(text);
      return json?.detail || json?.message || text || "Signup failed";
    } catch {
      return text || "Signup failed";
    }
  }

  async function register(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) return setMsg("❌ Please enter your email.");
    if (cleanPassword.length < 8)
      return setMsg("❌ Password must be at least 8 characters.");
    if (cleanPassword !== password2.trim())
      return setMsg("❌ Passwords do not match.");
    if (!acceptedTerms)
      return setMsg("❌ You must agree to the Terms and Privacy Policy.");

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      if (!res.ok) {
        const reason = await safeReadError(res);
        setMsg(`❌ ${reason}`);
        return;
      }

      const data = await res.json().catch(() => null);
      const token = data?.token;

      if (!token) {
        setMsg("❌ Signup succeeded but no token returned.");
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
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <section className="mx-auto max-w-md px-6 py-14">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
          <h1 className="text-2xl font-semibold text-slate-900">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            You’ll be able to upload your first document right away.
          </p>

          <form onSubmit={register} className="mt-6">
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
            />

            <label className="mt-4 block text-sm font-semibold text-slate-800">
              Password
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />

            <label className="mt-4 block text-sm font-semibold text-slate-800">
              Confirm password
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Repeat password"
            />

            {/* ✅ Terms & Privacy */}
            <label className="mt-4 flex items-start gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 accent-emerald-600"
              />
              <span>
                I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  className="font-semibold text-emerald-700 hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  className="font-semibold text-emerald-700 hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            <button
              disabled={loading || !acceptedTerms}
              className="mt-5 w-full rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>

          {msg && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {msg}
            </div>
          )}

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-semibold text-emerald-700 hover:underline"
            >
              Log in
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
