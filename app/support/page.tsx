"use client";

import { useState } from "react";
import Nav from "../../components/Nav";

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("Lease question");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<null | "loading" | "success" | "error">(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, topic, message }),
      });

      if (!res.ok) throw new Error("Failed");
      setStatus("success");

      setName("");
      setEmail("");
      setTopic("Lease question");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <Nav />

      <section className="mx-auto max-w-3xl px-6 py-14">
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold tracking-widest text-emerald-700">
            SUPPORT
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Contact support
          </h1>

          <p className="mt-3 text-slate-600">
            Tell us what document you’re working with and what you want clarified.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Name</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  type="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Topic</label>
              <select
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                <option>Lease question</option>
                <option>HOA rules / restrictions</option>
                <option>Closing documents</option>
                <option>Billing</option>
                <option>Bug / issue</option>
                <option>Feature request</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Message</label>
              <textarea
                className="mt-2 min-h-[140px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Example: ‘My lease says there’s a renewal clause—what does it mean and what deadlines should I track?’"
                required
              />
            </div>

            <button
              disabled={status === "loading"}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
            >
              {status === "loading" ? "Sending..." : "Send message"}
            </button>

            {status === "success" && (
              <p className="text-sm text-emerald-700">
                ✅ Sent! We received your message.
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-rose-700">
                ❌ Something went wrong. Try again.
              </p>
            )}
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Tip: Include the document type (Lease / HOA / Closing) and what outcome you want.
        </div>
      </section>
    </main>
  );
}
