"use client";

import Nav from "@/components/Nav";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type DocumentItem = {
  document_id: number;
  original_filename: string;
  stored_filename: string;
  created_at: string;
  status: "uploaded" | "in_review" | "completed" | string;
  review_notes?: string | null;
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

/** ---- AI PARSING (simple + robust) ----
 * Your AI returns markdown like:
 * ### 1. Plain-English Summary
 * ...
 * ### 2. Key Fees & Costs
 * ...
 */
function normalizeText(s: string) {
  return (s || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function pickSection(all: string, keywords: string[]) {
  const text = normalizeText(all);
  if (!text) return "";

  // Split on markdown headings
  const chunks = text.split(/\n#{2,4}\s+/g); // handles ## ### ####
  if (chunks.length <= 1) return text;

  // Re-add the first chunk if it’s content before headings
  const parts = chunks.map((c) => c.trim()).filter(Boolean);

  // Each part starts with heading line + body
  // e.g. "1. Plain-English Summary\nThis document..."
  for (const part of parts) {
    const firstLine = part.split("\n")[0]?.toLowerCase() || "";
    if (keywords.some((k) => firstLine.includes(k))) {
      return part.split("\n").slice(1).join("\n").trim();
    }
  }

  return "";
}

function bulletsOnly(text: string, maxBullets = 6) {
  const lines = normalizeText(text)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // keep bullet-like lines; if none, keep first few sentences-ish lines
  const bullets = lines.filter((l) => /^[-•*]\s+/.test(l) || /^\d+\./.test(l));
  const chosen = (bullets.length ? bullets : lines).slice(0, maxBullets);

  return chosen.join("\n");
}

function isPdfTextEmptyMessage(s: string) {
  const t = (s || "").toLowerCase();
  return (
    t.includes("no readable text") ||
    t.includes("no text was found") ||
    t.includes("empty") ||
    t.includes("could not extract")
  );
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

  // Parsed AI sections
  const [summaryText, setSummaryText] = useState("");
  const [feesDatesText, setFeesDatesText] = useState("");
  const [questionsText, setQuestionsText] = useState("");
  const [flagsText, setFlagsText] = useState("");

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

    const id = docId;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErr(null);

        const direct = await fetch(`${API_BASE}/documents/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!direct.ok) {
          throw new Error("Document not found");
        }

        const data: DocumentItem = await direct.json();
        if (cancelled) return;

        setDoc(data);

        const raw = normalizeText(data.review_notes || "");

        // If AI produced a single big response, split it into sections.
        // If it didn't split cleanly, we still display something.
        const s1 =
          pickSection(raw, ["plain-english summary", "plain english summary", "summary"]) ||
          raw;

        const s2 =
          pickSection(raw, ["key fees", "fees & costs", "fees and costs", "dates", "deadlines"]) ||
          "";

        const s3 =
          pickSection(raw, ["questions to ask", "questions"]) ||
          "";

        const s4 =
          pickSection(raw, ["red flags", "risks", "risk", "attention flags", "high-risk"]) ||
          "";

        // Keep output short + readable (your “brain can’t retain” note)
        setSummaryText(bulletsOnly(s1, 7));
        setFeesDatesText(bulletsOnly(s2 || "", 7));
        setQuestionsText(bulletsOnly(s3 || "", 7));
        setFlagsText(bulletsOnly(s4 || "", 7));

        // Responses UI (frontend-only)
        seedResponsesIfEmpty(id);
        setResponses(loadResponses(id));
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

  const reviewRaw = normalizeText(doc?.review_notes || "");
  const done = (status || "").toLowerCase().includes("complete");
  const noText = isPdfTextEmptyMessage(reviewRaw);

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
                    <AnalysisCard
                      title="Summary"
                      sub="Plain-English explanation of what matters most."
                      status={status}
                      content={done ? summaryText : ""}
                      fallback={
                        noText
                          ? "No readable text was found in this document."
                          : "Not ready yet — once processing completes, real content will appear automatically."
                      }
                    />
                    <AnalysisCard
                      title="Key dates & fees"
                      sub="Deposits, late fees, notice windows, renewal terms."
                      status={status}
                      content={done ? feesDatesText : ""}
                      fallback={
                        done
                          ? "No key dates/fees were detected in the extracted text."
                          : "Not ready yet — once processing completes, real content will appear automatically."
                      }
                    />
                    <AnalysisCard
                      title="Questions to ask"
                      sub="Targeted questions to reduce risk before signing."
                      status={status}
                      content={done ? questionsText : ""}
                      fallback={
                        done
                          ? "No questions were generated for this document."
                          : "Not ready yet — once processing completes, real content will appear automatically."
                      }
                    />
                  </>
                )}

                {tab === "flags" && (
                  <>
                    <AnalysisCard
                      title="Red flags"
                      sub="Clauses and details that commonly cause problems."
                      status={status}
                      content={done ? flagsText : ""}
                      fallback={
                        done
                          ? "No obvious red flags were detected in the extracted text."
                          : "Not ready yet — once processing completes, real content will appear automatically."
                      }
                    />
                    {/* Optional: show the full raw output (collapsed) */}
                    <RawOutputCard raw={reviewRaw} />
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
                      onClick={() => setTab("flags")}
                    >
                      Open red flags
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

function AnalysisCard({
  title,
  sub,
  status,
  content,
  fallback,
}: {
  title: string;
  sub: string;
  status: string;
  content: string;
  fallback: string;
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

  const [expanded, setExpanded] = useState(false);
  const safe = (content || "").trim();

  const showText = isDone && safe ? safe : fallback;
  const lines = showText.split("\n");
  const clipped = expanded ? showText : lines.slice(0, 10).join("\n");
  const canExpand = lines.length > 10;

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

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-800">
        <div className="whitespace-pre-wrap leading-relaxed">{clipped}</div>

        {canExpand ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 inline-flex text-sm font-semibold text-emerald-700 hover:underline"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function RawOutputCard({ raw }: { raw: string }) {
  const [open, setOpen] = useState(false);
  const text = (raw || "").trim();
  if (!text) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Full AI output</h3>
          <p className="mt-1 text-sm text-slate-600">
            For power users. (Most people won’t need this.)
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          {open ? "Hide" : "View"}
        </button>
      </div>

      {open ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-800 whitespace-pre-wrap">
          {text}
        </div>
      ) : null}
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
