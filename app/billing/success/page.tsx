"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BillingSuccessPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Finalizing your payment...");

  const API =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://doc-explainer-api.onrender.com";

  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMsg("You're signed out. Please log in again.");
          router.push("/auth");
          return;
        }

        // give webhook time
        await new Promise((r) => setTimeout(r, 4000));

        const res = await fetch(`${API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const me = await res.json();

        if (res.ok && me?.is_paid) {
          setMsg("Payment active ✅ Redirecting...");
          setTimeout(() => router.push("/dashboard"), 800);
          return;
        }

        setMsg("Payment received. If access isn’t active yet, refresh in 15–30 seconds.");
      } catch {
        setMsg("Couldn’t verify payment yet. Refresh in 15–30 seconds.");
      }
    };

    run();
  }, [API, router]);

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Payment Success</h1>
      <p style={{ marginTop: 12 }}>{msg}</p>
    </div>
  );
}
