"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const STORAGE_KEY = "affiliate_ref_code";
const TS_KEY = "affiliate_ref_ts";
const DAYS_30 = 30 * 24 * 60 * 60 * 1000;

export default function ReferralRedirectPage() {
  const router = useRouter();
  const params = useParams<{ code: string }>();
  const code = (params?.code || "").toString().trim();

  useEffect(() => {
    if (!code) {
      router.replace("/register");
      return;
    }

    // Save referral code for 30 days
    try {
      const now = Date.now();
      const existingTs = Number(localStorage.getItem(TS_KEY) || "0");

      // overwrite if expired or missing
      if (!existingTs || now - existingTs > DAYS_30) {
        localStorage.setItem(STORAGE_KEY, code);
        localStorage.setItem(TS_KEY, String(now));
      } else {
        // keep existing referral unless you want "last-click wins"
        // localStorage.setItem(STORAGE_KEY, code);
      }
    } catch {
      // ignore storage errors
    }

    router.replace("/register");
  }, [code, router]);

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
        Redirecting you to sign up…
      </div>
    </main>
  );
}
