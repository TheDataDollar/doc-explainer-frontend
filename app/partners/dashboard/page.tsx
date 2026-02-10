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
  clicks?: number;
  signups?: number;
  paid_conversions?: number;
};

type RangeKey = "7d" | "30d" | "all";

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

function Icon({
  name,
  className,
}: {
  name:
    | "spark"
    | "link"
    | "copy"
    | "logout"
    | "arrow"
    | "shield"
    | "bolt"
    | "money"
    | "users"
    | "cursor";
  className?: string;
}) {
  const base = "h-5 w-5";
  const cls = cn(base, className);
  switch (name) {
    case "spark":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2l1.7 6.2L20 10l-6.3 1.8L12 18l-1.7-6.2L4 10l6.3-1.8L12 2z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "link":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M10 13a5 5 0 010-7l1-1a5 5 0 017 7l-1 1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M14 11a5 5 0 010 7l-1 1a5 5 0 01-7-7l1-1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "copy":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 9h10v10H9V9z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "logout":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M10 7V6a2 2 0 012-2h7a2 2 0 012 2v12a2 2 0 01-2 2h-7a2 2 0 01-2-2v-1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M3 12h11"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M7 8l-4 4 4 4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "arrow":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 12h14"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "shield":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "bolt":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M13 2L3 14h7l-1 8 12-14h-7l-1-6z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "money":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 7h18v10H3V7z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M7 12h.01M17 12h.01"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M12 10a2 2 0 100 4 2 2 0 000-4z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      );
    case "users":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M9 11a4 4 0 100-8 4 4 0 000 8z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M22 21v-2a4 4 0 00-3-3.87"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M16 3.13a4 4 0 010 7.75"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "cursor":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 4l8 18 2-7 7-2L4 4z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-slate-100 blur-2xl" />
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-slate-50 blur-2xl" />
      </div>

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-700">{label}</div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </div>
          {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
        </div>

        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-900">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="h-4 w-32 rounded bg-slate-200" />
      <div className="mt-4 h-8 w-24 rounded bg-slate-200" />
      <div className="mt-3 h-3 w-40 rounded bg-slate-100" />
    </div>
  );
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

export default function PartnerDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<AffiliateMe | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [range, setRange] = useState<RangeKey>("30d");
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

  const clicks = me?.clicks ?? 0;
  const signups = me?.signups ?? 0;
  const paidConversions = me?.paid_conversions ?? 0;

  const planPrice = 49; // adjust later (or return from backend)
  const commissionRate = me?.commission_rate ?? 0.3;
  const estMonthlyEarnings = paidConversions * planPrice * commissionRate;

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
        // token invalid/expired -> force login
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
      // fallback: prompt for manual copy
      window.prompt("Copy this:", text);
    }
  }

  function logout() {
    clearAffiliateToken();
    router.push("/partners/login");
  }

  const nameLabel =
    me?.display_name?.trim() ||
    (me?.email ? maskEmail(me.email) : "Partner");

  return (
    <main className="relative">
      {/* Soft background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
        <div className="absolute left-1/2 top-[-120px] h-[320px] w-[720px] -translate-x-1/2 rounded-full bg-slate-100 blur-3xl opacity-60" />
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              <Icon name="spark" className="h-4 w-4" />
              Affiliate Partner Portal
            </div>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome, {nameLabel}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Share your link, track performance, and watch your earnings grow.
              V1 keeps it simple — and powerful.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/partners"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              Back to Partners <Icon name="arrow" className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              <Icon name="logout" className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>

        {/* Status + Link */}
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-700">
                  Your status
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                      badgeClass
                    )}
                  >
                    <Icon name={isApproved ? "shield" : "bolt"} className="h-4 w-4" />
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
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-700">
                    Your referral link
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Share this link anywhere — it tracks signups + paid upgrades.
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() =>
                      copyText(refCode, "Copied referral code to clipboard.")
                    }
                    disabled={!refCode}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
                    title="Copy referral code"
                  >
                    <Icon name="copy" className="h-4 w-4" />
                    Copy code
                  </button>

                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Open signup <Icon name="arrow" className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <Icon name="link" className="h-4 w-4 text-slate-500" />
                    <span className="truncate">
                      {referralLink || "No referral code assigned yet"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    copyText(referralLink, "Copied referral link to clipboard.")
                  }
                  disabled={!referralLink}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
                >
                  <Icon name="copy" className="h-4 w-4" />
                  Copy link
                </button>
              </div>
            </div>

            {/* Range toggle (UI-ready for future stats endpoint) */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-semibold text-slate-700">
                Performance range
              </div>

              <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                {(["7d", "30d", "all"] as RangeKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setRange(k)}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs font-semibold transition",
                      range === k
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {k === "7d" ? "Last 7 days" : k === "30d" ? "Last 30 days" : "All time"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2 text-xs text-slate-500">
              Currently showing your saved totals. When you add{" "}
              <span className="font-semibold">/affiliate/stats?range=</span>, this toggle will
              become fully dynamic.
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-extrabold text-slate-900">
              Quick actions
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Get share-ready in seconds.
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <button
                onClick={() =>
                  copyText(
                    `Use my link to try Document Explainer: ${referralLink}`,
                    "Copied share message."
                  )
                }
                disabled={!referralLink}
                className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
              >
                Copy share message
                <Icon name="arrow" className="h-4 w-4 text-slate-500" />
              </button>

              <button
                onClick={() => copyText(referralLink, "Copied referral link.")}
                disabled={!referralLink}
                className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
              >
                Copy link again
                <Icon name="arrow" className="h-4 w-4 text-slate-500" />
              </button>

              <Link
                href="/support"
                className="inline-flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Ask for help
                <Icon name="arrow" className="h-4 w-4 text-white/80" />
              </Link>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
              <div className="font-semibold text-slate-900">Pro tip</div>
              Put your link in bio + pin it in your Telegram / Discord. Consistent
              visibility beats a single big post.
            </div>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

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

        {/* Stats */}
        {!loading && !error && (
          <div className="mt-8">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-slate-900">
                  Performance
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Range:{" "}
                  <span className="font-semibold text-slate-700">
                    {range === "7d"
                      ? "Last 7 days"
                      : range === "30d"
                      ? "Last 30 days"
                      : "All time"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setToast("Tip: add /affiliate/stats?range= for live range data.")}
                className="hidden sm:inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
              >
                <Icon name="spark" className="h-4 w-4" />
                Make it live
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Clicks"
                value={`${clicks}`}
                icon={<Icon name="cursor" className="h-5 w-5" />}
              />
              <StatCard
                label="Signups"
                value={`${signups}`}
                icon={<Icon name="users" className="h-5 w-5" />}
              />
              <StatCard
                label="Paid conversions"
                value={`${paidConversions}`}
                icon={<Icon name="bolt" className="h-5 w-5" />}
              />
              <StatCard
                label="Est. monthly earnings"
                value={`$${estMonthlyEarnings.toFixed(2)}`}
                hint={`Rate: ${(commissionRate * 100).toFixed(0)}% · Plan: $${planPrice}/mo`}
                icon={<Icon name="money" className="h-5 w-5" />}
              />
            </div>

            {/* Next section placeholders for V1+ */}
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">
                      Recent referrals
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      V1 placeholder — next we’ll wire /affiliate/referrals.
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                    Coming next
                  </span>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                  Want this live fast? Add endpoint:
                  <div className="mt-2 font-mono text-[11px] text-slate-700">
                    GET /affiliate/referrals?limit=10
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">
                      Payouts
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      V1 can show “estimated / pending / paid” monthly buckets.
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                    Coming next
                  </span>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                  When ready, we’ll wire:
                  <div className="mt-2 font-mono text-[11px] text-slate-700">
                    GET /affiliate/payouts
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-8 text-xs text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900">
              <Icon name="spark" className="h-4 w-4" />
            </span>
            Document Explainer Partner Program
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-slate-900 hover:underline">
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-slate-900 hover:underline"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
