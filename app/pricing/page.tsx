"use client";

import Footer from "../../components/Footer";
import Link from "next/link";
import Nav from "@/components/Nav";
import { useMemo, useState } from "react";

const YEARLY_PRICE: 420 | 1100 = 420;
type Billing = "monthly" | "yearly";

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("monthly");

  const API =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://doc-explainer-api.onrender.com";

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
      window.location.href = "/login";
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

  const monthly = { starter: 0, pro: 47, business: 209 };
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
        cta: { label: "Start Business", onClick: () => startCheckout("business") },
        badge: "For teams",
      },
    ],
    [billing]
  );

  const pricingFor = (planKey: "starter" | "pro" | "business") =>
    billing === "monthly" ? monthly[planKey] : yearly[planKey];

  const periodFor = () => (billing === "monthly" ? "/mo" : "/yr");

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
            Choose monthly for flexibility or yearly to simplify renewals and budgeting.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-5xl">
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {billing === "monthly" ? "Monthly selected" : "Yearly selected"}
              </div>
              <div className="mt-1 text-sm text-slate-600">
                {billing === "monthly"
                  ? "Pay month-to-month. Cancel anytime."
                  : "One payment for the year. Great for budgeting."}
              </div>
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
                />
              );
            })}
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Prices shown in USD. Taxes may apply. Non-legal summaries and highlights only.
          </p>
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
}) {
  return (
    <div
      className={[
        "relative rounded-3xl border bg-white/80 p-6 shadow-sm backdrop-blur",
        highlight ? "border-emerald-200 shadow-lg" : "border-slate-200 hover:shadow-md",
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
