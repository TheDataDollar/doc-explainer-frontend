"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { affiliateFetch } from "@/lib/affiliateApi";
import { clearAffiliateToken, getAffiliateToken } from "@/lib/affiliateAuth";

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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold text-slate-700">{label}</div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

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

export default function PartnerDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<AffiliateMe | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refCode = me?.ref_code || "";
  const referralLink = useMemo(() => {
    if (!refCode) return "";
    return `https://document-explainer-blond.vercel.app/r/${refCode}`;
  }, [refCode]);

  const isApproved = (me?.status || "").toLowerCase() === "approved";

  const badgeClass = isApproved
    ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
    : "border border-amber-200 bg-amber-50 text-amber-900";

  const badgeText = isApproved ? "Approved" : "Pending approval";

  const clicks = me?.clicks ?? 0;
  const signups = me?.signups ?? 0;
  const paidConversions = me?.paid_conversions ?? 0;

  const planPrice = 49; // adjust later if you want dynamic pricing
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
        // expects backend route like: GET /affiliate/me
        const data = await affiliateFetch("/affiliate/me", { method: "GET" });
        if (!alive) return;
        setMe(data || null);
      } catch (e: any) {
        if (!alive) return;
        // if token invalid/expired -> force login
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

  async function copyLink() {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      alert("Copied referral link!");
    } catch {
      alert("Copy failed — please copy manually.");
    }
  }

  function logout() {
    clearAffiliateToken();
    router.push("/partners/login");
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            Partner Dashboard
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Track referrals and manage your partner link.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/partners"
            className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Back to Partners
          </Link>

          <button
            type="button"
            onClick={logout}
            className="inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Log out
          </button>
        </div>
      </div>

      {loading && (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Loading dashboard…
        </div>
      )}

      {!loading && error && (
        <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900 shadow-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Status */}
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-700">
                  Status
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}
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
                  <div className="mt-2 text-xs text-slate-500">
                    Logged in as <span className="font-semibold">{me.email}</span>
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

            {/* Referral link */}
            <div className="mt-6">
              <div className="text-xs font-semibold text-slate-700">
                Your referral link
              </div>

              <div className="mt-2 flex gap-3">
                <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {referralLink || "No referral code assigned yet"}
                </div>

                <button
                  onClick={copyLink}
                  disabled={!referralLink}
                  className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Clicks" value={`${clicks}`} />
            <StatCard label="Signups" value={`${signups}`} />
            <StatCard label="Paid conversions" value={`${paidConversions}`} />
            <StatCard
              label="Est. monthly earnings"
              value={`$${estMonthlyEarnings.toFixed(2)}`}
              hint={`Rate: ${(commissionRate * 100).toFixed(0)}%`}
            />
          </div>
        </>
      )}
    </main>
  );
}
