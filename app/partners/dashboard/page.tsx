"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { affiliateFetch } from "@/lib/affiliateApi";
import { clearAffiliateToken, getAffiliateToken } from "@/lib/affiliateAuth";

type AffiliateMe = {
  id?: number;
  email?: string;
  display_name?: string | null;
  status?: string; // "pending" | "approved" | ...
  ref_code?: string;
  commission_rate?: number;

  // live counters
  clicks?: number;
  signups?: number;
  paid_conversions?: number;

  // ✅ live earnings (must come from backend; no guessing)
  est_monthly_earnings?: number;
};

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  const head = name.slice(0, 2);
  const tail = name.slice(-1);
  return `${head}***${tail}@${domain}`;
}

function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg">
        {message}
        <button
          onClick={onClose}
          className="ml-3 text-xs font-semibold text-slate-500 hover:text-slate-900"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold text-slate-600">{label}</div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

function SkeletonBlock() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="h-4 w-40 rounded bg-slate-200" />
      <div className="mt-4 h-10 w-2/3 rounded bg-slate-100" />
      <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
    </div>
  );
}

export default function PartnerDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<AffiliateMe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const refCode = me?.ref_code || "";

  const referralLink = useMemo(() => {
    if (!refCode) return "";
    return `https://document-explainer-blond.vercel.app/r/${refCode}`;
  }, [refCode]);

  const isApproved = (me?.status || "").toLowerCase() === "approved";
  const badgeClass = isApproved
    ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
    : "border border-amber-200 bg-amber-50 text-amber-900";
  const badgeText = isApproved ? "Approved" : "Pending";

  // ✅ Live counters only (no mock math)
  const clicks = me?.clicks ?? 0;
  const signups = me?.signups ?? 0;
  const paidConversions = me?.paid_conversions ?? 0;

  // ✅ Derived from live counters (truth-based)
  const activeSignups = paidConversions;
  const pendingSignups = Math.max(0, signups - paidConversions);

  // ✅ Commission rate from backend (truth-based)
  const commissionRate = me?.commission_rate ?? 0;

  // ✅ Earnings ONLY if backend provides it (no guessing)
  const estMonthlyEarningsLive =
    typeof me?.est_monthly_earnings === "number" ? me.est_monthly_earnings : null;

  const nameLabel =
    me?.display_name?.trim() ||
    (me?.email ? maskEmail(me.email) : "Partner");

  useEffect(() => {
    const token = getAffiliateToken();
    if (!token) {
      router.replace("/partners/login");
      return;
    }

    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await affiliateFetch("/affiliate/me", { method: "GET" });
        if (!alive) return;
        setMe(data || null);
      } catch (e: any) {
        if (!alive) return;
        clearAffiliateToken();
        router.replace("/partners/login");
        setError(e?.message || "Failed to load partner dashboard");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [router]);

  async function copyText(text: string, successMsg: string) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setToast(successMsg);
    } catch {
      window.prompt("Copy this:", text);
    }
  }

  function logout() {
    clearAffiliateToken();
    router.push("/partners/login");
  }

  return (
    <main className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-slate-50 via-white to-white" />
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Top bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-600">
              Affiliate Dashboard
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome, {nameLabel}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Share your link and track your results — all live.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/partners"
              className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              Back
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Sub-nav */}
        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href="/partners/dashboard"
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          >
            Overview
          </Link>
          <Link
            href="/partners/referrals"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
          >
            Referrals
          </Link>
          <Link
            href="/partners/payouts"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
          >
            Payouts
          </Link>
          <Link
            href="/partners/assets"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
          >
            Assets
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <SkeletonBlock />
            <SkeletonBlock />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900 shadow-sm">
            <div className="font-extrabold">Couldn’t load dashboard</div>
            <div className="mt-1 text-rose-800">{error}</div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Retry
              </button>
              <Link
                href="/support"
                className="rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-900 hover:bg-rose-100"
              >
                Contact support
              </Link>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {/* Status + referral link */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-600">
                    Status
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                        badgeClass
                      )}
                    >
                      {badgeText}
                    </span>
                    {!isApproved && (
                      <span className="text-xs text-slate-500">
                        Referrals won’t count until approved.
                      </span>
                    )}
                  </div>

                  {me?.email && (
                    <div className="mt-3 text-xs text-slate-500">
                      Logged in as{" "}
                      <span className="font-semibold text-slate-700">
                        {me.email}
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  href="/support"
                  className="text-xs font-semibold text-slate-900 hover:underline"
                >
                  Contact support
                </Link>
              </div>

              <div className="mt-6">
                <div className="text-xs font-semibold text-slate-600">
                  Your referral link
                </div>

                <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <span className="break-all">
                    {referralLink || "No referral code assigned yet"}
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => copyText(referralLink, "Copied referral link.")}
                    disabled={!referralLink}
                    className="inline-flex flex-1 items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    Copy link
                  </button>
                  <button
                    onClick={() => copyText(refCode, "Copied referral code.")}
                    disabled={!refCode}
                    className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
                  >
                    Copy code
                  </button>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  Tip: pin your link in your bio + Telegram group.
                </div>
              </div>
            </div>

            {/* At a glance (all live, no mock plan price) */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-extrabold text-slate-900">
                At a glance
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Live partner metrics.
              </div>

              <div className="mt-5 grid gap-3">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-xs font-semibold text-slate-600">
                    Commission rate
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">
                    {(commissionRate * 100).toFixed(0)}%
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-xs font-semibold text-slate-600">
                    Active signups
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">
                    {activeSignups}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div className="text-xs font-semibold text-slate-600">
                    Pending signups
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">
                    {pendingSignups}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-xs font-semibold text-slate-600">
                    Est. monthly earnings
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">
                    {estMonthlyEarningsLive === null
                      ? "—"
                      : `$${estMonthlyEarningsLive.toFixed(2)}`}
                  </div>
                </div>

                {estMonthlyEarningsLive === null && (
                  <div className="text-xs text-slate-500">
                    Earnings will appear when the backend sends{" "}
                    <span className="font-semibold">est_monthly_earnings</span>.
                  </div>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="lg:col-span-3">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Clicks" value={`${clicks}`} />
                <StatCard label="Signups" value={`${signups}`} />
                <StatCard label="Active signups" value={`${activeSignups}`} />
                <StatCard
                  label="Est. monthly earnings"
                  value={
                    estMonthlyEarningsLive === null
                      ? "—"
                      : `$${estMonthlyEarningsLive.toFixed(2)}`
                  }
                  hint={
                    commissionRate > 0
                      ? `Rate ${(commissionRate * 100).toFixed(0)}%`
                      : undefined
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
