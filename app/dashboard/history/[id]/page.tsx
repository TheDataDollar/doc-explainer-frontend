// app/dashboard/history/[id]/page.tsx
"use client";

import Nav from "../../../../components/Nav";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type DocumentItem = {
  document_id: number;
  original_filename: string;
  stored_filename: string;
  created_at: string;
  status: "uploaded" | "in_review" | "completed" | string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000";

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function prettyDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type ResponseEvent = {
  id: string;
  kind: "system" | "ai" | "user";
  title: string;
  body?: string;
  createdAt: string;
  isNew?: boolean;
};

function lsKeyForResponses(docId: number) {
  return `docResponses:${docId}`;
}

function seedResponsesIfEmpty(docId: number) {
  try {
    const key = lsKeyForResponses(docId);
    const existing = localStorage.getItem(key);
    if (existing) return;

    const now = new Date();
    const earlier = new Date(now.getTime() - 1000 * 60 * 60 * 6);

    const seed: ResponseEvent[] = [
      {
        id: "seed-1",
        kind: "system",
        title: "Document uploaded",
        body: "Your document is stored securely and queued for analysis.",
        createdAt: earlier.toISOString(),
      },
      {
        id: "seed-2",
        kind: "ai",
        title: "Waiting for processing output",
        body:
          "When analysis completes, detected risks and suggested questions will appear automatically.",
        createdAt: now.toISOString(),
        isNew: true,
      },
    ];

    localStorage.setItem(key, JSON.stringify(seed));
  } catch {
    // ignore
  }
}

function loadResponses(docId: number): ResponseEvent[] {
  try {
    const raw = localStorage.getItem(lsKeyForResponses(docId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function markResponsesRead(docId: number) {
  try {
    const events = loadResponses(docId).map((e) => ({ ...e, isNew: false }));
    localStorage.setItem(lsKeyForResponses(docId), JSON.stringify(events));
  } catch {
    // ignore
  }
}

function pushUserResponse(docId: number, text: string) {
  try {
    const events = loadResponses(docId);
    const next: ResponseEvent = {
      id: `u-${Date.now()}`,
      kind: "user",
      title: "Note / question added",
      body: text,
      createdAt: new Date().toISOString(),
      isNew: true,
    };
    localStorage.setItem(lsKeyForResponses(docId), JSON.stringify([next, ...events]));
  } catch {
    // ignore
  }
}

function statusLabel(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "completed" || s.includes("complete")) return "Completed";
  if (s === "in_review" || s.includes("review") || s.includes("process"))
    return "In review";
  return "Uploaded";
}

function statusPill(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "completed" || s.includes("complete"))
    return "bg-emerald-100 text-emerald-800";
  if (s === "in_review" || s.includes("review") || s.includes("process"))
    return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-800";
}

export default function DocumentHubPage() {
  const router = useRouter();
  const params = useParams();

  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [tab, setTab] = useState<"overview" | "flags" | "responses" | "history">(
    "overview"
  );

  const [responses, setResponses] = useState<ResponseEvent[]>([]);
  const [note, setNote] = useState("");

  const docId = useMemo(() => {
    const raw = (params as any)?.id as string | string[] | undefined;
    const idStr = Array.isArray(raw) ? raw[0] : raw;
    const n = Number(idStr);
    return Number.isFinite(n) ? n : null;
  }, [params]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!docId) {
      setErr("Invalid document id.");
      setLoading(false);
      return;
    }

    // ✅ capture a non-null id for inner async usage (fixes the red lines)
    const id = docId;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErr(null);

        const direct = await fetch(`${API_BASE}/documents/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (direct.ok) {
          const data = await direct.json();
          if (!cancelled) setDoc(data);
        } else {
          const list = await fetch(`${API_BASE}/documents`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!list.ok) throw new Error("Failed to load document list");
          const docs: DocumentItem[] = await list.json();
          const found = Array.isArray(docs)
            ? docs.find((d) => d.document_id === id)
            : null;

          if (!found) throw new Error("Document not found");
          if (!cancelled) setDoc(found);
        }

        // Responses UI (frontend-only)
        seedResponsesIfEmpty(id);
        const ev = loadResponses(id);
        if (!cancelled) setResponses(ev);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router, docId]);

  const newCount = useMemo(
    () => responses.filter((r) => r.isNew).length,
    [responses]
  );

  useEffect(() => {
    if (!docId) return;
    if (tab === "responses") {
      markResponsesRead(docId);
      setResponses(loadResponses(docId));
    }
  }, [tab, docId]);

  const status = doc?.status || "uploaded";
  const pill = statusPill(status);
  const label = statusLabel(status);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <Nav />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Document hub
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Summary, red flags, responses, and change history — all in one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/history")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Back to history
            </button>
            <button
              onClick={() => router.push("/upload")}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Upload another
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-5 text-sm text-slate-600 shadow-sm">
            Loading document…
          </div>
        )}

        {err && (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
            {err}
          </div>
        )}

        {!loading && !err && doc && (
          <>
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="text-sm text-slate-600">Filename</div>
                  <div className="mt-1 truncate text-lg font-semibold text-slate-900">
                    {doc.original_filename}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Uploaded: {prettyDate(doc.created_at)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "h-fit rounded-full px-3 py-1 text-xs font-semibold",
                      pill
                    )}
                  >
                    {label}
                  </span>

                  <Link
                    href="/pricing"
                    className="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 md:inline-flex"
                  >
                    Business features
                  </Link>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>
                  Overview
                </TabButton>
                <TabButton active={tab === "flags"} onClick={() => setTab("flags")}>
                  Red flags
                </TabButton>
                <TabButton active={tab === "responses"} onClick={() => setTab("responses")}>
                  Responses
                  {newCount > 0 && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                      {newCount} new
                    </span>
                  )}
                </TabButton>
                <TabButton active={tab === "history"} onClick={() => setTab("history")}>
                  History
                </TabButton>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {tab === "overview" && (
                  <>
                    <PlaceholderCard title="Summary" sub="Plain-English explanation of what matters most." status={status} />
                    <PlaceholderCard title="Key dates & fees" sub="Deposits, late fees, notice windows, renewal terms." status={status} />
                    <PlaceholderCard title="Questions to ask" sub="Targeted questions to reduce risk before signing." status={status} />
                  </>
                )}

                {tab === "flags" && (
                  <>
                    <PlaceholderCard title="High-risk clauses" sub="Clauses that often shift liability, deadlines, or cost." status={status} />
                    <PlaceholderCard title="Ambiguities" sub="Language that’s unclear, missing, or contradictory." status={status} />
                  </>
                )}

                {tab === "responses" && (
                  <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Responses & updates</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          Updates, detected changes, and your notes (frontend-only UI for now).
                        </p>
                      </div>
                      <Link
                        href="/pricing"
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                      >
                        Upgrade
                      </Link>
                    </div>

                    <div className="mt-5 flex flex-col gap-3">
                      <label className="text-sm font-semibold text-slate-800">Add a note / question</label>
                      <textarea
                        className="min-h-[90px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Example: ‘Does this clause allow the seller to cancel without penalty?’"
                      />
                      <button
                        onClick={() => {
                          if (!docId) return;
                          const text = note.trim();
                          if (!text) return;
                          pushUserResponse(docId, text);
                          setNote("");
                          setResponses(loadResponses(docId));
                        }}
                        className="w-fit rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                      >
                        Save note
                      </button>
                    </div>

                    <div className="mt-6 space-y-3">
                      {responses.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
                          No responses yet.
                        </div>
                      ) : (
                        responses
                          .slice()
                          .sort((a, b) => {
                            const ad = new Date(a.createdAt).getTime();
                            const bd = new Date(b.createdAt).getTime();
                            return (isNaN(bd) ? 0 : bd) - (isNaN(ad) ? 0 : ad);
                          })
                          .map((r) => <ResponseCard key={r.id} r={r} />)
                      )}
                    </div>
                  </div>
                )}

                {tab === "history" && (
                  <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                    <h3 className="text-lg font-semibold text-slate-900">Version history</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Track revisions and detected changes here (backend wiring later).
                    </p>
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
                      Placeholder: show versions, diffs, and “what changed” summaries.
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                  <h3 className="text-base font-semibold text-slate-900">Next actions</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Focused, professional steps for this document.
                  </p>

                  <div className="mt-4 space-y-2">
                    <button
                      className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                      onClick={() => alert("Next: export/share output (coming soon)")}
                    >
                      Export / share (coming soon)
                    </button>

                    <button
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                      onClick={() => router.push("/draft?from=dashboard")}
                    >
                      Draft related doc
                    </button>

                    <button
                      className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
                      onClick={() => setTab("responses")}
                    >
                      Open responses
                      {newCount > 0 ? (
                        <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                          {newCount}
                        </span>
                      ) : null}
                    </button>
                  </div>

                  <p className="mt-4 text-xs text-slate-500">
                    Non-legal summaries for clarity. For legal decisions, consult a qualified professional.
                  </p>
                </div>

                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
                  <div className="font-semibold">Premium positioning</div>
                  <div className="mt-1 text-emerald-800/90">
                    Document-centric updates • Professional timeline • Built for business workflows
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  );
}

function PlaceholderCard({
  title,
  sub,
  status,
}: {
  title: string;
  sub: string;
  status: string;
}) {
  const s = (status || "").toLowerCase();
  const isDone = s === "completed" || s.includes("complete");
  const isReview =
    s === "in_review" || s.includes("review") || s.includes("process");

  const label = isDone ? "Ready" : isReview ? "Processing" : "Queued";
  const pill = isDone
    ? "bg-emerald-100 text-emerald-800"
    : isReview
    ? "bg-amber-100 text-amber-800"
    : "bg-slate-100 text-slate-800";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{sub}</p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", pill)}>
          {label}
        </span>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
        {isDone ? (
          <div>Placeholder: display real output here when backend is wired.</div>
        ) : (
          <div>
            Not ready yet — once processing completes, real content will appear automatically.
          </div>
        )}
      </div>
    </div>
  );
}

function ResponseCard({ r }: { r: ResponseEvent }) {
  const badge =
    r.kind === "ai"
      ? "bg-slate-900 text-white"
      : r.kind === "user"
      ? "bg-white border border-slate-200 text-slate-700"
      : "bg-emerald-50 border border-emerald-200 text-emerald-900";

  const label = r.kind === "ai" ? "AI" : r.kind === "user" ? "You" : "System";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", badge)}>
              {label}
            </span>
            {r.isNew ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                New
              </span>
            ) : null}
          </div>

          <div className="mt-2 text-sm font-semibold text-slate-900">{r.title}</div>
          {r.body ? (
            <div className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {r.body}
            </div>
          ) : null}
        </div>

        <div className="shrink-0 text-xs font-medium text-slate-500">
          {prettyDate(r.createdAt)}
        </div>
      </div>
    </div>
  );
}
