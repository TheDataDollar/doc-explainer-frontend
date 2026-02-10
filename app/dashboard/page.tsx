"use client";

import Nav from "@/components/Nav";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MeResponse = {
  user_id: number;
  email: string;
  free_docs_used: number;
  is_paid: boolean;
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

type UpgradeReason = "draft" | "upload_limit";

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

  // ✅ Upgrade modal state
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason>("draft");

  const isPaid = !!me?.is_paid;
  const freeUsed = me?.free_docs_used ?? 0;
  const freeLimitReached = !isPaid && freeUsed >= 3;

  function openUpgrade(reason: UpgradeReason) {
    setUpgradeReason(reason);
    setShowUpgrade(true);
  }

  function goPricing() {
    setShowUpgrade(false);
    router.push("/pricing");
  }

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

    // poll inbox counts (frontend-only)
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <Nav />

      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Track leases, HOA docs, and closing paperwork in one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isPaid ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                Paid Plan Active
              </span>
            ) : (
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                Free Plan
              </span>
            )}

            {/* Inbox shortcut */}
            <button
              className={cn(
                "rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50",
                inboxNew > 0 && "border-emerald-200"
              )}
              onClick={() => router.push("/dashboard/responses")}
              title="Open responses inbox"
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

            {/* ✅ Draft document (Pro-only hard lock) */}
            <button
              className={cn(
                "rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50",
                !isPaid && "opacity-90"
              )}
              onClick={() => {
                if (!isPaid) return openUpgrade("draft");
                router.push("/draft?from=dashboard");
              }}
              title={isPaid ? "Draft a document" : "Pro feature"}
            >
              <span className="inline-flex items-center gap-2">
                Draft document
                {!isPaid ? (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                    🔒 Pro
                  </span>
                ) : null}
              </span>
            </button>

            {/* ✅ New upload (blocked if free limit reached) */}
            <button
              className={cn(
                "rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700",
                freeLimitReached && "bg-slate-400 hover:bg-slate-400"
              )}
              onClick={() => {
                if (freeLimitReached) return openUpgrade("upload_limit");
                router.push("/upload");
              }}
              title={
                freeLimitReached
                  ? "Free limit reached — upgrade to continue"
                  : "Upload a new document"
              }
            >
              <span className="inline-flex items-center gap-2">
                New upload
                {freeLimitReached ? (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
                    3/3 used
                  </span>
                ) : null}
              </span>
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-5 text-sm text-slate-600 shadow-sm">
            Loading your dashboard…
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* KPI Cards */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Documents (last 30 days)"
                value={String(stats.last30Count)}
                sub="Real usage"
              />
              <StatCard
                label="Completed"
                value={String(stats.completed)}
                sub="Ready summaries"
              />
              <StatCard
                label="In review"
                value={String(stats.inReview)}
                sub="Pending"
              />
              <StatCard
                label="Time saved (est.)"
                value={`${stats.estimatedTimeSavedHours.toFixed(1)} hrs`}
                sub="Will become exact later"
              />
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-3">
              {/* Recent docs */}
              <div className="lg:col-span-2 space-y-8">
                <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Recent documents
                    </h2>
                    <button
                      className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
                      onClick={() => router.push("/dashboard/history")}
                    >
                      View all
                    </button>
                  </div>

                  <div className="mt-4 divide-y divide-slate-200">
                    {recentDocs.length === 0 ? (
                      <div className="py-10 text-center text-sm text-slate-600">
                        No documents in this view yet. Click <b>New upload</b> to
                        add a file.
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

                {/* Premium Inbox Card */}
                <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Responses inbox
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        A central place for updates, detected changes, and your
                        notes across all documents.
                      </p>
                    </div>

                    <button
                      className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                      onClick={() => router.push("/dashboard/responses")}
                    >
                      Open inbox
                    </button>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <MiniStat
                      label="New updates"
                      value={String(inboxNew)}
                      highlight
                    />
                    <MiniStat label="Total items" value={String(inboxTotal)} />
                    <MiniStat
                      label="Focus"
                      value={inboxNew > 0 ? "Review new" : "All clear"}
                    />
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <div className="font-semibold text-slate-900">
                      How this works
                    </div>
                    <div className="mt-1 text-slate-600">
                      Each document hub can receive updates. This inbox
                      aggregates them so you don’t miss changes.
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-8">
                {/* Analysis tools submenu */}
                <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                  <h3 className="text-base font-semibold text-slate-900">
                    Analysis tools
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Filter your pipeline and focus on what needs attention.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <FilterPill
                      label="All"
                      active={docFilter === "all"}
                      onClick={() => setDocFilter("all")}
                    />
                    <FilterPill
                      label="Uploaded"
                      active={docFilter === "uploaded"}
                      onClick={() => setDocFilter("uploaded")}
                    />
                    <FilterPill
                      label="In review"
                      active={docFilter === "in_review"}
                      onClick={() => setDocFilter("in_review")}
                    />
                    <FilterPill
                      label="Completed"
                      active={docFilter === "completed"}
                      onClick={() => setDocFilter("completed")}
                    />
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <div className="font-semibold text-slate-900">
                      Output Builder
                    </div>
                    <div className="mt-1 text-slate-600">
                      {hasSavedOutputBuilder
                        ? "Your last settings are saved from Upload."
                        : "Set your preferences in Upload to get better summaries."}
                    </div>

                    <button
                      className="mt-3 w-full rounded-xl border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                      onClick={() => {
                        if (freeLimitReached) return openUpgrade("upload_limit");
                        router.push("/upload");
                      }}
                    >
                      Open Output Builder
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    <button
                      className={cn(
                        "w-full rounded-2xl py-3 text-sm font-semibold shadow-sm",
                        freeLimitReached
                          ? "bg-slate-400 text-white"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      )}
                      onClick={() => {
                        if (freeLimitReached) return openUpgrade("upload_limit");
                        router.push("/upload");
                      }}
                    >
                      Analyze a new document
                    </button>

                    <button
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                      onClick={() =>
                        alert("Next: show flags/issues per document (coming soon)")
                      }
                    >
                      Review flagged issues (coming soon)
                    </button>

                    <button
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                      onClick={() =>
                        alert("Next: export summaries / share to client (coming soon)")
                      }
                    >
                      Export / share summaries (coming soon)
                    </button>
                  </div>

                  <p className="mt-4 text-xs text-slate-500">
                    Summaries are informational only — not legal advice.
                  </p>
                </div>

                {/* Account overview */}
                <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Account overview
                  </h2>

                  <div className="mt-4 space-y-3 text-sm text-slate-700">
                    <div className="flex justify-between">
                      <span>Email</span>
                      <span className="font-medium">{me?.email ?? "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Plan</span>
                      <span className="font-medium">
                        {isPaid ? "Pro (Paid)" : "Free"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total documents</span>
                      <span className="font-medium">{docs.length}</span>
                    </div>

                    {!isPaid && (
                      <div className="flex justify-between">
                        <span>Free usage</span>
                        <span className="font-medium">{freeUsed}/3</span>
                      </div>
                    )}
                  </div>

                  <button
                    className="mt-5 w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    onClick={() => router.push("/pricing")}
                  >
                    Upgrade plan
                  </button>
                </div>

                {/* Support */}
                <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Need help?
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Our support team understands real estate docs.
                  </p>
                  <button
                    className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
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

      {/* ✅ Upgrade Modal */}
      {showUpgrade && (
        <UpgradeModal
          reason={upgradeReason}
          freeUsed={freeUsed}
          onClose={() => setShowUpgrade(false)}
          onUpgrade={goPricing}
        />
      )}
    </main>
  );
}

/* ---------- Upgrade modal ---------- */

function UpgradeModal({
  reason,
  freeUsed,
  onClose,
  onUpgrade,
}: {
  reason: UpgradeReason;
  freeUsed: number;
  onClose: () => void;
  onUpgrade: () => void;
}) {
  const title =
    reason === "draft"
      ? "🔒 Pro feature"
      : "Free limit reached";

  const message =
    reason === "draft"
      ? "Draft Document is available on the Pro plan."
      : `You’ve used ${Math.min(freeUsed, 3)}/3 free documents. Upgrade to continue uploading unlimited documents.`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{message}</p>

            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <div className="font-semibold">What you unlock on Pro</div>
              <ul className="mt-2 list-disc pl-5 text-emerald-900/90">
                <li>Unlimited uploads</li>
                <li>Draft Document tool</li>
                <li>Faster workflow & priority support</li>
              </ul>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Not now
          </button>
          <button
            onClick={onUpgrade}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Upgrade to Pro
          </button>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          Cancel anytime. No legal advice — summaries and drafting assist only.
        </div>
      </div>
    </div>
  );
}

/* ---------- Helpers & UI bits ---------- */

function prettyDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
        highlight && "border-emerald-200 bg-emerald-50/40"
      )}
    >
      <div className="text-xs font-semibold text-slate-600">{label}</div>
      <div className="mt-2 text-xl font-semibold text-slate-900">{value}</div>
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
    <div className="flex items-center justify-between py-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-slate-900">{name}</div>
        <div className="text-xs text-slate-500">{date}</div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles}`}
        >
          {label}
        </span>
        <button
          onClick={onOpen}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
        >
          Open
        </button>
      </div>
    </div>
  );
}

function FilterPill({
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
      className={[
        "rounded-full px-3 py-1 text-xs font-semibold border transition",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
