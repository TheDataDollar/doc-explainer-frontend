// app/pricing/page.tsx (FULL COPY / REPLACE)
"use client";

import Footer from "../../components/Footer";
import Link from "next/link";
import Nav from "@/components/Nav";
import { useMemo, useState } from "react";

/**
 * Choose your yearly price:
 * - 420  => $420/yr (nice entry yearly)
 * - 1100 => $1100/yr (premium yearly)
 */
const YEARLY_PRICE: 420 | 1100 = 420;

type Billing = "monthly" | "yearly";

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("monthly");

  const API =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://doc-explainer-api.onrender.com";

  // ✅ Stripe TEST Price IDs (match backend ALLOWED_PRICE_IDS)
  // Mapping:
  // "Pro" plan -> $47 (Starter product in Stripe)
  // "Business" plan -> $209 (Pro product in Stripe)
  const PRICE_IDS = {
    pro: {
      monthly: "price_1Sz0cSLBOsv1gBi7yQoqTO0n",
      yearly: "price_1Sz0cTLBOsv1gBi7DKZyGbLy",
    },
    business: {
      monthly: "price_1Sz0dZLBOsv1gBi7fqenphoj",
      yearly: "price_1Sz0dZLBOsv1gBi72C7VtbH8",
    },
  } as const;

  async function startCheckout(planKey: "pro" | "business") {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/auth";
      return;
    }

    const priceId =
      billing === "monthly"
        ? PRICE_IDS[planKey].monthly
        : PRICE_IDS[planKey].yearly;

    const res = await fetch(`${API}/billing/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ price_id: priceId }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data?.detail || "Checkout failed");
      return;
    }

    window.location.href = data.url;
  }

  const monthly = {
    starter: 0,
    pro: 47,
    business: 209,
  };

  const yearly = {
    starter: 0,
    pro: YEARLY_PRICE,
    business: YEARLY_PRICE === 420 ? 1100 : 1900,
  };

  const plans = useMemo(
    () => [
      {
        key: "starter",
        name: "Starter",
        blurb: "For trying it out",
        whoFor: "Solo landlord testing a few docs",
        features: [
          "Up to 3 documents (free)",
          "Plain-English summary",
          "Key dates & fees highlights",
          "Email support",
        ],
        cta: { label: "Try free", href: "/register" },
        badge: null as null | string,
      },
      {
        key: "pro",
        name: "Pro",
        blurb: "Best for most users",
        whoFor: "Property manager or broker reviewing docs weekly",
        features: [
          "Unlimited uploads",
          "Faster summaries + key flags",
          "Upload history & statuses",
          "Priority support",
        ],
        cta: { label: "Start Pro", onClick: () => startCheckout("pro") },
        badge: "Most popular",
      },
      {
        key: "business",
        name: "Business",
        blurb: "For teams & high volume",
        whoFor: "Teams managing multiple properties/clients",
        features: [
          "Everything in Pro",
          "Team seats (coming next)",
          "Shared templates (coming next)",
          "Fastest support response",
        ],
        cta: {
          label: "Start Business",
          onClick: () => startCheckout("business"),
        },
        badge: "For teams",
      },
    ],
    [billing]
  );

  const pricingFor = (planKey: "starter" | "pro" | "business") => {
    return billing === "monthly" ? monthly[planKey] : yearly[planKey];
  };

  const periodFor = () => (billing === "monthly" ? "/mo" : "/yr");

  const dealFor = (planKey: "starter" | "pro" | "business") => {
    const m = monthly[planKey];
    const y = yearly[planKey];
    if (m === 0 || y === 0) return null;

    const yearlyIfMonthly = m * 12;
    const save = yearlyIfMonthly - y;

    if (save <= 0) {
      return {
        saveDollars: 0,
        savePct: 0,
        effectiveMonthly: y / 12,
      };
    }

    const savePct = Math.round((save / yearlyIfMonthly) * 100);
    return {
      saveDollars: save,
      savePct,
      effectiveMonthly: y / 12,
    };
  };

  const topSummary = useMemo(() => {
    if (billing === "monthly") {
      return {
        title: "Monthly selected",
        sub: "Pay month-to-month. Cancel anytime.",
        pill: "Flexible",
      };
    }

    const proDeal = dealFor("pro");
    const dealText =
      proDeal && proDeal.saveDollars > 0
        ? `Save $${proDeal.saveDollars}/yr (${proDeal.savePct}%) on Pro`
        : "One payment for the year. Great for budgeting.";

    return {
      title: "Yearly selected",
      sub: dealText,
      pill: "Best value",
    };
  }, [billing]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/50 to-white">
      <Nav />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-widest text-emerald-700">
            PRICING
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Plans built for real estate workflows
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
            Choose monthly for flexibility or yearly to simplify renewals and
            budgeting.
          </p>

          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
            Built for landlords, property managers, and brokers who review real
            documents every week — and want clarity without the confusion.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-5xl">
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-slate-900">
                  {topSummary.title}
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                  {topSummary.pill}
                </span>
              </div>
              <div className="mt-1 text-sm text-slate-600">{topSummary.sub}</div>
            </div>

            <div className="flex items-center justify-center">
              <div className="rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                <button
                  onClick={() => setBilling("monthly")}
                  className={[
                    "inline-flex rounded-full px-4 py-2 text-sm font-semibold transition",
                    billing === "monthly"
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling("yearly")}
                  className={[
                    "inline-flex rounded-full px-4 py-2 text-sm font-semibold transition",
                    billing === "yearly"
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  Yearly
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-5xl">
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((p) => {
              const key = p.key as "starter" | "pro" | "business";
              const price = pricingFor(key);
              const deal = billing === "yearly" ? dealFor(key) : null;

              return (
                <PlanCard
                  key={p.key}
                  name={p.name}
                  badge={p.badge}
                  blurb={p.blurb}
                  whoFor={p.whoFor}
                  price={price}
                  period={periodFor()}
                  features={p.features}
                  cta={p.cta}
                  highlight={p.key === "pro"}
                  deal={
                    deal
                      ? {
                          saveDollars: deal.saveDollars,
                          savePct: deal.savePct,
                          effectiveMonthly: deal.effectiveMonthly,
                        }
                      : null
                  }
                  showDeal={billing === "yearly"}
                />
              );
            })}
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Prices shown in USD. Taxes may apply. Non-legal summaries and
            highlights only.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h3 className="text-base font-semibold text-slate-900">
                Who is this for?
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Landlords, property managers, leasing teams, and brokers who
                review leases, HOA docs, addendums, and closing paperwork often.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h3 className="text-base font-semibold text-slate-900">
                Who is this NOT for?
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Anyone needing legal advice or attorney review. We summarize and
                highlight attention areas (non-legal), not provide legal counsel.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Need help choosing?</p>
            <p className="mt-1 text-slate-600">
              If you’re handling documents weekly, start with Pro. If you manage
              multiple properties or a team, Business is the best fit.
            </p>
            <div className="mt-4">
              <Link
                href="/support"
                className="inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Talk to support
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function PlanCard({
  name,
  badge,
  blurb,
  whoFor,
  price,
  period,
  features,
  cta,
  highlight,
  showDeal,
  deal,
}: {
  name: string;
  badge: string | null;
  blurb: string;
  whoFor: string;
  price: number;
  period: string;
  features: string[];
  cta: { label: string; href?: string; onClick?: () => void };
  highlight?: boolean;
  showDeal: boolean;
  deal: null | { saveDollars: number; savePct: number; effectiveMonthly: number };
}) {
  return (
    <div
      className={[
        "relative rounded-3xl border bg-white/80 p-6 shadow-sm backdrop-blur",
        highlight
          ? "border-emerald-200 shadow-lg"
          : "border-slate-200 hover:shadow-md",
      ].join(" ")}
    >
      {badge && (
        <div className="absolute -top-3 left-6 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          {badge}
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
        <p className="mt-1 text-sm text-slate-600">{blurb}</p>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <div className="text-4xl font-semibold tracking-tight text-slate-900">
          {price === 0 ? "$0" : `$${price}`}
        </div>
        <div className="text-sm text-slate-500">{period}</div>
      </div>

      {showDeal && deal && name !== "Starter" && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-900">
          <div className="font-semibold">
            {deal.saveDollars > 0
              ? `Save $${deal.saveDollars}/yr (${deal.savePct}%)`
              : "Yearly pricing"}
          </div>
          <div className="mt-1 text-emerald-800/90">
            Equivalent to <b>${deal.effectiveMonthly.toFixed(0)}/mo</b>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">
        <span className="font-semibold text-slate-900">Best for:</span> {whoFor}
      </div>

      <ul className="mt-5 space-y-2 text-sm text-slate-700">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-600" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {cta.onClick ? (
        <button
          onClick={cta.onClick}
          className={[
            "mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition",
            highlight
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
          ].join(" ")}
        >
          {cta.label}
        </button>
      ) : (
        <Link
          href={cta.href || "/register"}
          className={[
            "mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition",
            highlight
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
          ].join(" ")}
        >
          {cta.label}
        </Link>
      )}

      <p className="mt-3 text-center text-xs text-slate-500">
        Cancel anytime (monthly). Yearly renews annually.
      </p>
    </div>
  );
}
