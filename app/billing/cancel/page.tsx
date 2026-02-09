"use client";

import { useRouter } from "next/navigation";

export default function BillingCancelPage() {
  const router = useRouter();
  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Payment Canceled</h1>
      <p style={{ marginTop: 12 }}>No charge was made. You can try again anytime.</p>
      <button
        onClick={() => router.push("/pricing")}
        style={{ marginTop: 16, padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd" }}
      >
        Back to pricing
      </button>
    </div>
  );
}
