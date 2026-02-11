"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const CODE_KEY = "affiliate_ref_code";
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://doc-explainer-api.onrender.com";

export default function ReferralRedirectPage() {
  const router = useRouter();
  const params = useParams<{ code: string }>();
  const code = (params?.code || "").toString().trim();

  useEffect(() => {
    async function run() {
      if (code) {
        try {
          localStorage.setItem(CODE_KEY, code);
        } catch {}

        // ✅ track click (public)
        try {
          await fetch(
            `${API_BASE}/affiliate/track-click/${encodeURIComponent(code)}`,
            { method: "POST" }
          );
        } catch {}
      }

      router.replace("/register");
    }

    run();
  }, [code, router]);

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
        Redirecting…
      </div>
    </main>
  );
}
