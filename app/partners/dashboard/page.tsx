"use client";

import Link from "next/link";

const TOKEN_KEY = "affiliate_token";

export function setAffiliateToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAffiliateToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAffiliateToken() {
  localStorage.removeItem(TOKEN_KEY);
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold text-slate-700">{label}</div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export default function PartnerDashboardPage() {
  /* 
    V1 SAFE STATE
    This avoids ALL union / literal comparison issues.
    Backend will later send this boolean.
  */
  const isApproved = false;

  const refCode = "YOURCODE123";
  const referralLink = `https://document-explainer-blond.vercel.app/r/${refCode}`;

  const clicks = 0;
  const signups = 0;
  const paidConversions = 0;

  const planPrice = 49;
  const commissionRate = 0.3;
  const estMonthlyEarnings = paidConversions * planPrice * commissionRate;

  const badgeClass = isApproved
    ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
    : "border border-amber-200 bg-amber-50 text-amber-900";

  const badgeText = isApproved ? "Approved" : "Pending approval";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      alert("Copied referral link!");
    } catch {
      alert("Copy failed — please copy manually.");
    }
  }

  function logout() {
    alert("Logout wiring next.");
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

      {/* Status */}
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-700">Status</div>
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
              {referralLink}
            </div>

            <button
              onClick={copyLink}
              className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
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
        />
      </div>
    </main>
  );
}
