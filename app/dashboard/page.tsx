"use client";

import Nav from "@/components/Nav";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MeResponse = {
  user_id: number;
  email: string;
  free_docs_used: number;
  is_paid: boolean;
  plan_tier?: "free" | "pro" | "business";
};

type DocumentItem = {
  document_id: number;
  original_filename: string;
  stored_filename: string;
  created_at: string;
  status: "uploaded" | "in_review" | "completed";
};

type ResponseEvent = {
  id: string;
  kind: "system" | "ai" | "user";
  title: string;
  body?: string;
  createdAt: string;
  isNew?: boolean;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function getInboxCounts() {
  try {
    let total = 0;
    let newCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("docResponses:")) continue;

      const raw = localStorage.getItem(key);
      if (!raw) continue;

      let parsed: any = [];
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = [];
      }
      if (!Array.isArray(parsed)) continue;

      total += parsed.length;
      for (const e of parsed as ResponseEvent[]) {
        if (e?.isNew) newCount += 1;
      }
    }

    return { total, newCount };
  } catch {
    return { total: 0, newCount: 0 };
  }
}

export default function DashboardPage() {
  const router = useRouter();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [docFilter, setDocFilter] = useState<
    "all" | "uploaded" | "in_review" | "completed"
  >("all");

  const [inboxNew, setInboxNew] = useState(0);
  const [inboxTotal, setInboxTotal] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [meRes, docsRes] = await Promise.all([
          fetch(`${API_BASE}/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/documents`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!meRes.ok) throw new Error("Failed to load account");
        if (!docsRes.ok) throw new Error("Failed to load documents");

        const meData: MeResponse = await meRes.json();
        const docsData: DocumentItem[] = await docsRes.json();

        if (cancelled) return;

        setMe(meData);
        setDocs(Array.isArray(docsData) ? docsData : []);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    const refreshInbox = () => {
      const c = getInboxCounts();
      setInboxNew(c.newCount);
      setInboxTotal(c.total);
    };
    refreshInbox();
    const t = window.setInterval(refreshInbox, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, [router]);

  const stats = useMemo(() => {
    const now = Date.now();
    const days30 = 30 * 24 * 60 * 60 * 1000;

    const last30 = docs.filter((d) => {
      const t = new Date(d.created_at).getTime();
      return !Number.isNaN(t) && now - t <= days30;
    });

    const completed = docs.filter((d) => d.status === "completed").length;
    const inReview = docs.filter((d) => d.status === "in_review").length;
    const uploaded = docs.filter((d) => d.status === "uploaded").length;

    const estimatedRisksFlagged = Math.max(0, Math.round(completed * 0.3));
    const estimatedTimeSavedHours = Math.max(0, (completed * 18) / 60);

    return {
      last30Count: last30.length,
      completed,
      inReview,
      uploaded,
      estimatedRisksFlagged,
      estimatedTimeSavedHours,
    };
  }, [docs]);

  const filteredDocs = useMemo(() => {
    if (docFilter === "all") return docs;
    return docs.filter((d) => d.status === docFilter);
  }, [docs, docFilter]);

  const recentDocs = useMemo(() => filteredDocs.slice(0, 6), [filteredDocs]);

  const hasSavedOutputBuilder = useMemo(() => {
    try {
      return !!localStorage.getItem("outputBuilder");
    } catch {
      return false;
    }
  }, []);

  async function openBillingPortal() {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      const res = await fetch(`${API_BASE}/billing/portal`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.detail || "Could not open billing portal");
        return;
      }

      if (data?.url) window.location.href = data.url;
      else alert("Billing portal unavailable. Please contact support.");
    } catch {
      alert("Network error opening billing portal. Please try again.");
    }
  }

  const tierLabel =
    me?.plan_tier === "business"
      ? "Business"
      : me?.plan_tier === "pro"
      ? "Pro"
      : me?.is_paid
      ? "Paid"
      : "Free";

  const tierTone =
    me?.plan_tier === "business" || me?.is_paid
      ? "bg-emerald-600 text-white border-emerald-500"
      : "bg-white text-slate-700 border-slate-200";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-white to-white">
      <Nav />

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Header/hero (unchanged) */}
        <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur sm:p-6 md:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-slate-200/40 blur-3xl" />

          <div className="relative grid gap-5 lg:grid-cols-[1fr_420px] lg:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  Dashboard
                </h1>

                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm",
                    tierTone
                  )}
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-white/90" />
                  {me?.is_paid ? `${tierLabel} Plan` : "Free Plan"}
                </span>

                {me?.is_paid ? (
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                    Unlimited uploads
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {me?.free_docs_used ?? 0}/3 free docs used
                  </span>
                )}
              </div>

              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                A premium workspace to analyze leases, HOA docs, and closing
                paperwork — with clear risks, key terms, and next steps.
              </p>

              <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
                <button
                  className="w-full sm:w-auto rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                  onClick={() => router.push("/upload")}
                >
                  New upload
                </button>

                <button
                  className={cn(
                    "w-full sm:w-auto rounded-2xl border bg-white px-5 py-3 text-sm font-semibold shadow-sm hover:bg-slate-50",
                    inboxNew > 0 ? "border-emerald-200" : "border-slate-200"
                  )}
                  onClick={() => router.push("/dashboard/responses")}
                >
                  <span className="inline-flex items-center gap-2">
                    Responses
                    {inboxNew > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                        {inboxNew}
                      </span>
                    ) : null}
                  </span>
                </button>

                <button
                  className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                  onClick={() => router.push("/draft?from=dashboard")}
                >
                  Draft a document
                </button>

                {me?.is_paid ? (
                  <button
                    className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                    onClick={openBillingPortal}
                  >
                    Manage billing
                  </button>
                ) : (
                  <button
                    className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                    onClick={() => router.push("/pricing")}
                  >
                    Upgrade
                  </button>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <BadgeSoft>Not legal advice</BadgeSoft>
                <BadgeSoft>Secure billing via Stripe</BadgeSoft>
                <BadgeSoft>Designed for real estate workflows</BadgeSoft>
              </div>
            </div>

            <div className="w-full max-w-full overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    This week at a glance
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    Quick signal on what’s moving.
                  </div>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  Live
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <MiniKpi
                  label="In review"
                  value={String(stats.inReview)}
                  tone="amber"
                />
                <MiniKpi
                  label="Completed"
                  value={String(stats.completed)}
                  tone="emerald"
                />
                <MiniKpi
                  label="Updates"
                  value={String(inboxNew)}
                  tone={inboxNew > 0 ? "emerald" : "slate"}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold text-slate-700">
                  Recommended next action
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {stats.inReview > 0
                    ? "Review documents in progress"
                    : stats.completed > 0
                    ? "Open your latest completed report"
                    : "Upload your first document for analysis"}
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  {stats.inReview > 0
                    ? "Keep your pipeline moving — in-review docs become reports when analysis completes."
                    : stats.completed > 0
                    ? "See key terms, risks, and suggested questions in one place."
                    : "Get a summary + key terms + risk flags in minutes."}
                </div>
                <button
                  className="mt-3 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                  onClick={() =>
                    router.push(
                      stats.inReview > 0 ? "/dashboard/history" : "/upload"
                    )
                  }
                >
                  {stats.inReview > 0 ? "View pipeline" : "Start upload"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-600 shadow-sm backdrop-blur">
            Loading your dashboard…
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                title="Documents (30 days)"
                value={String(stats.last30Count)}
                sub="Activity in the last month"
                hint="Tracks uploads created in the last 30 days."
              />
              <KpiCard
                title="Completed reports"
                value={String(stats.completed)}
                sub="Ready for review"
                hint="Completed documents have summaries + key terms."
              />
              <KpiCard
                title="Estimated risks"
                value={String(stats.estimatedRisksFlagged)}
                sub="Items worth checking"
                hint="Placeholder estimate until structured scoring is finalized."
              />
              <KpiCard
                title="Time saved (est.)"
                value={`${stats.estimatedTimeSavedHours.toFixed(1)} hrs`}
                sub="Based on completed reports"
                hint="Estimate shown — will become exact later."
              />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {/* ✅ Recent documents: now hard-clamped to width */}
                <div className="max-w-full overflow-hidden rounded-[24px] border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold text-slate-900">
                        Recent documents
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        Open a report to view summary, key terms, and risks.
                      </p>
                    </div>

                    <div className="w-full sm:w-auto">
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <FilterChip
                          label="All"
                          active={docFilter === "all"}
                          onClick={() => setDocFilter("all")}
                        />
                        <FilterChip
                          label="Uploaded"
                          active={docFilter === "uploaded"}
                          onClick={() => setDocFilter("uploaded")}
                        />
                        <FilterChip
                          label="In review"
                          active={docFilter === "in_review"}
                          onClick={() => setDocFilter("in_review")}
                        />
                        <FilterChip
                          label="Completed"
                          active={docFilter === "completed"}
                          onClick={() => setDocFilter("completed")}
                        />
                        <button
                          className="shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                          onClick={() => router.push("/dashboard/history")}
                        >
                          View all
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 divide-y divide-slate-200/70">
                    {recentDocs.length === 0 ? (
                      <div className="py-10 text-center text-sm text-slate-600">
                        No documents yet. Click <b>New upload</b> to add one.
                      </div>
                    ) : (
                      recentDocs.map((d) => (
                        <DocumentRow
                          key={d.document_id}
                          name={d.original_filename}
                          status={d.status}
                          date={prettyDate(d.created_at)}
                          onOpen={() =>
                            router.push(`/dashboard/history/${d.document_id}`)
                          }
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* ✅ Workspace tools: hard clamp */}
                <div className="max-w-full overflow-hidden rounded-[24px] border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
                  <h3 className="text-base font-semibold text-slate-900">
                    Workspace tools
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Quick actions for your workflow.
                  </p>

                  <div className="mt-4 grid gap-3">
                    <ActionCard
                      title="Analyze a new document"
                      body="Upload a lease, HOA, or closing doc to generate a report."
                      cta="Start upload"
                      onClick={() => router.push("/upload")}
                      accent="emerald"
                    />
                    <ActionCard
                      title="Draft a document"
                      body="Business plan feature: generate a draft you can refine."
                      cta="Open drafting"
                      onClick={() => router.push("/draft?from=dashboard")}
                      accent="slate"
                    />
                    <ActionCard
                      title="Output Builder"
                      body={
                        hasSavedOutputBuilder
                          ? "Configured — your preferences will apply to future uploads."
                          : "Not configured — set preferences for stronger outputs."
                      }
                      cta="Configure"
                      onClick={() => router.push("/upload")}
                      accent="white"
                    />
                  </div>

                  <p className="mt-4 text-xs text-slate-500">
                    Summaries are informational only — not legal advice.
                  </p>
                </div>

                {/* ✅ Need help: hard clamp */}
                <div className="max-w-full overflow-hidden rounded-[24px] border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Need help?
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Support built for real estate documents.
                  </p>
                  <button
                    className="mt-4 w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    onClick={() => router.push("/support")}
                  >
                    Contact support
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

/* ---------- UI ---------- */

function prettyDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function BadgeSoft({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
      {children}
    </span>
  );
}

function KpiCard({
  title,
  value,
  sub,
  hint,
}: {
  title: string;
  value: string;
  sub: string;
  hint?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-200/30 blur-2xl transition group-hover:scale-110" />
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
      {hint ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

function MiniKpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "amber" | "slate";
}) {
  const toneCls =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-slate-200 bg-white text-slate-900";

  return (
    <div className={cn("rounded-2xl border p-3", toneCls)}>
      <div className="text-[11px] font-semibold opacity-80">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-2 text-xs font-semibold border transition shadow-sm",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      )}
    >
      {label}
    </button>
  );
}

function ActionCard({
  title,
  body,
  cta,
  onClick,
  accent,
}: {
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
  accent: "emerald" | "slate" | "white";
}) {
  const cls =
    accent === "emerald"
      ? "border-emerald-200 bg-emerald-50/50"
      : accent === "slate"
      ? "border-slate-200 bg-slate-50"
      : "border-slate-200 bg-white";

  const btn =
    accent === "emerald"
      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
      : "bg-slate-900 hover:bg-slate-800 text-white";

  return (
    <div className={cn("max-w-full overflow-hidden rounded-2xl border p-4", cls)}>
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-600">{body}</div>
      <button
        className={cn(
          "mt-3 w-full max-w-full rounded-xl py-2.5 text-sm font-semibold shadow-sm",
          btn
        )}
        onClick={onClick}
      >
        {cta}
      </button>
    </div>
  );
}

function DocumentRow({
  name,
  status,
  date,
  onOpen,
}: {
  name: string;
  status: "uploaded" | "in_review" | "completed";
  date: string;
  onOpen: () => void;
}) {
  const label =
    status === "completed"
      ? "Completed"
      : status === "in_review"
      ? "In review"
      : "Uploaded";

  const statusStyles =
    status === "completed"
      ? "bg-emerald-100 text-emerald-800"
      : status === "in_review"
      ? "bg-amber-100 text-amber-800"
      : "bg-slate-100 text-slate-800";

  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-slate-900">
          {name}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>{date}</span>
          <span className="text-slate-300">•</span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
              statusStyles
            )}
          >
            {label}
          </span>
        </div>
      </div>

      <button
        onClick={onOpen}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
      >
        Open report
      </button>
    </div>
  );
}
