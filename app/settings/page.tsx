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
  // optional if you add later
  mailing_name?: string | null;
  mailing_line1?: string | null;
  mailing_line2?: string | null;
  mailing_city?: string | null;
  mailing_state?: string | null;
  mailing_zip?: string | null;
  mailing_country?: string | null;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
      {children}
    </span>
  );
}

function Card({
  title,
  subtitle,
  right,
  children,
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
      <div className="mt-6">{children}</div>
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

type SectionKey = "account" | "billing" | "security" | "address" | "signout";

function SectionButton({
  active,
  label,
  description,
  onClick,
}: {
  active: boolean;
  label: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl border px-4 py-3 text-left shadow-sm transition",
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
      )}
    >
      <div className={cn("text-sm font-semibold", active && "text-white")}>
        {label}
      </div>
      {description ? (
        <div
          className={cn(
            "mt-1 text-xs",
            active ? "text-white/80" : "text-slate-500"
          )}
        >
          {description}
        </div>
      ) : null}
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // panel navigation
  const [section, setSection] = useState<SectionKey>("account");

  // change password
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNext, setPwNext] = useState("");
  const [pwNext2, setPwNext2] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  // change email
  const [emailNext, setEmailNext] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);

  // mailing address
  const [addrBusy, setAddrBusy] = useState(false);
  const [addrMsg, setAddrMsg] = useState<string | null>(null);

  const [mailingName, setMailingName] = useState("");
  const [mailingLine1, setMailingLine1] = useState("");
  const [mailingLine2, setMailingLine2] = useState("");
  const [mailingCity, setMailingCity] = useState("");
  const [mailingState, setMailingState] = useState("");
  const [mailingZip, setMailingZip] = useState("");
  const [mailingCountry, setMailingCountry] = useState("US");

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

        // seed address fields if backend includes them (optional)
        setMailingName(data.mailing_name || "");
        setMailingLine1(data.mailing_line1 || "");
        setMailingLine2(data.mailing_line2 || "");
        setMailingCity(data.mailing_city || "");
        setMailingState(data.mailing_state || "");
        setMailingZip(data.mailing_zip || "");
        setMailingCountry(data.mailing_country || "US");
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

  // expects backend endpoint:
  // POST /auth/change-password { current_password, new_password }
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

  // expects backend endpoint:
  // POST /auth/change-email { new_email }
  async function changeEmail() {
    setEmailMsg(null);

    const next = emailNext.trim().toLowerCase();
    if (!next || !next.includes("@")) {
      setEmailMsg("Enter a valid email.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      setEmailBusy(true);
      const res = await fetch(`${API_BASE}/auth/change-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ new_email: next }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEmailMsg(data?.detail || "Could not change email.");
        return;
      }

      setEmailNext("");
      setEmailMsg("Email updated.");

      // refresh /me so UI updates
      const meRes = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meRes.ok) setMe(await meRes.json());
    } catch {
      setEmailMsg("Network error. Try again.");
    } finally {
      setEmailBusy(false);
    }
  }

  // expects backend endpoint:
  // POST /me/address { mailing_name, mailing_line1, mailing_line2, mailing_city, mailing_state, mailing_zip, mailing_country }
  async function saveAddress() {
    setAddrMsg(null);

    if (!mailingLine1.trim() || !mailingCity.trim() || !mailingState.trim() || !mailingZip.trim()) {
      setAddrMsg("Fill out Line 1, City, State, and ZIP.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      setAddrBusy(true);
      const res = await fetch(`${API_BASE}/me/address`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mailing_name: mailingName.trim() || null,
          mailing_line1: mailingLine1.trim(),
          mailing_line2: mailingLine2.trim() || null,
          mailing_city: mailingCity.trim(),
          mailing_state: mailingState.trim(),
          mailing_zip: mailingZip.trim(),
          mailing_country: mailingCountry.trim() || "US",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAddrMsg(data?.detail || "Could not save address.");
        return;
      }

      setAddrMsg("Address saved.");

      // refresh /me so UI updates if backend returns fields
      const meRes = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meRes.ok) setMe(await meRes.json());
    } catch {
      setAddrMsg("Network error. Try again.");
    } finally {
      setAddrBusy(false);
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

      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Settings
              </h1>
              {!loading && !error && me ? <Pill>{tierLabel}</Pill> : null}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Choose a section on the left to edit one thing at a time.
            </p>
          </div>

          <button
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
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
          <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
            {/* LEFT MENU */}
            <div className="space-y-3">
              <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur">
                <div className="text-xs font-semibold text-slate-700">
                  Settings sections
                </div>
                <div className="mt-3 space-y-2">
                  <SectionButton
                    active={section === "account"}
                    label="Account"
                    description="Email, plan, usage"
                    onClick={() => setSection("account")}
                  />
                  <SectionButton
                    active={section === "billing"}
                    label="Plan & billing"
                    description="Manage your subscription"
                    onClick={() => setSection("billing")}
                  />
                  <SectionButton
                    active={section === "security"}
                    label="Security"
                    description="Change password"
                    onClick={() => setSection("security")}
                  />
                  <SectionButton
                    active={section === "address"}
                    label="Mailing address"
                    description="For invoices / payouts"
                    onClick={() => setSection("address")}
                  />
                  <SectionButton
                    active={section === "signout"}
                    label="Sign out"
                    description="Log out of this device"
                    onClick={() => setSection("signout")}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 text-xs text-slate-600 shadow-sm backdrop-blur">
                Tip: this layout keeps the page clean on mobile and avoids
                “everything at once” clutter.
              </div>
            </div>

            {/* RIGHT PANEL (ONE AT A TIME) */}
            <div className="space-y-6">
              {section === "account" && (
                <Card
                  title="Account"
                  subtitle="View your account details and update your email."
                  right={<Pill>{tierLabel}</Pill>}
                >
                  <div className="space-y-3">
                    <Row label="Current email" value={me?.email ?? "—"} />
                    <Row label="Plan" value={tierLabel} />
                    {!me?.is_paid ? (
                      <Row
                        label="Free usage"
                        value={`${me?.free_docs_used ?? 0}/3`}
                      />
                    ) : null}
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold text-slate-900">
                      Change email
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      This will update the email you use to log in.
                    </p>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        value={emailNext}
                        onChange={(e) => setEmailNext(e.target.value)}
                        type="email"
                        className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                        placeholder="new@email.com"
                      />
                      <button
                        onClick={changeEmail}
                        disabled={emailBusy}
                        className={cn(
                          "rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800",
                          emailBusy && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        {emailBusy ? "Saving…" : "Update email"}
                      </button>
                    </div>

                    {emailMsg ? (
                      <div
                        className={cn(
                          "mt-3 rounded-2xl border px-4 py-3 text-sm",
                          emailMsg === "Email updated."
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                            : "border-rose-200 bg-rose-50 text-rose-900"
                        )}
                      >
                        {emailMsg}
                      </div>
                    ) : null}

                    <p className="mt-3 text-xs text-slate-500">
                      Backend needed:{" "}
                      <span className="font-mono">POST /auth/change-email</span>
                    </p>
                  </div>
                </Card>
              )}

              {section === "billing" && (
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
              )}

              {section === "security" && (
                <Card title="Security" subtitle="Change your password safely.">
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
                      Backend needed:{" "}
                      <span className="font-mono">POST /auth/change-password</span>
                    </p>
                  </div>
                </Card>
              )}

              {section === "address" && (
                <Card
                  title="Mailing address"
                  subtitle="Add an address for invoices / payouts (optional for now)."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Full name (optional)
                      </label>
                      <input
                        value={mailingName}
                        onChange={(e) => setMailingName(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                        placeholder="Name on mail"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Address line 1
                      </label>
                      <input
                        value={mailingLine1}
                        onChange={(e) => setMailingLine1(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                        placeholder="123 Main St"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Address line 2 (optional)
                      </label>
                      <input
                        value={mailingLine2}
                        onChange={(e) => setMailingLine2(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                        placeholder="Apt, suite, unit"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700">
                        City
                      </label>
                      <input
                        value={mailingCity}
                        onChange={(e) => setMailingCity(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700">
                        State
                      </label>
                      <input
                        value={mailingState}
                        onChange={(e) => setMailingState(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                        placeholder="State"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700">
                        ZIP
                      </label>
                      <input
                        value={mailingZip}
                        onChange={(e) => setMailingZip(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                        placeholder="ZIP"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700">
                        Country
                      </label>
                      <input
                        value={mailingCountry}
                        onChange={(e) => setMailingCountry(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                        placeholder="US"
                      />
                    </div>
                  </div>

                  {addrMsg ? (
                    <div
                      className={cn(
                        "mt-4 rounded-2xl border px-4 py-3 text-sm",
                        addrMsg === "Address saved."
                          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                          : "border-rose-200 bg-rose-50 text-rose-900"
                      )}
                    >
                      {addrMsg}
                    </div>
                  ) : null}

                  <button
                    onClick={saveAddress}
                    disabled={addrBusy}
                    className={cn(
                      "mt-5 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800",
                      addrBusy && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {addrBusy ? "Saving…" : "Save address"}
                  </button>

                  <p className="mt-3 text-xs text-slate-500">
                    Backend needed:{" "}
                    <span className="font-mono">POST /me/address</span>
                  </p>
                </Card>
              )}

              {section === "signout" && (
                <Card title="Sign out" subtitle="Log out of this device.">
                  <button
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                    onClick={logout}
                  >
                    Log out
                  </button>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                    If you’re on a shared computer, signing out keeps your account
                    safe.
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
