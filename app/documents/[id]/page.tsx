"use client";

import Nav from "../../components/Nav";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

<Link href="/documents/history" style={{ textDecoration: "underline" }}>
  View Upload History
</Link>

type DocumentItem = {
  document_id: number;
  original_filename: string;
  stored_filename: string;
  created_at: string;
  status: "uploaded" | "in_review" | "completed";
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

function prettyDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DocumentDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const docId = useMemo(() => {
    const raw = params?.id;
    const n = Number(raw);
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

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErr(null);

        // Try a direct endpoint first (if your backend supports it)
        const direct = await fetch(`${API_BASE}/documents/${docId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (direct.ok) {
          const data = await direct.json();
          if (!cancelled) setDoc(data);
          return;
        }

        // Fallback: fetch all documents and find the one we need
        const list = await fetch(`${API_BASE}/documents`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!list.ok) throw new Error("Failed to load document list");
        const docs: DocumentItem[] = await list.json();
        const found = Array.isArray(docs)
          ? docs.find((d) => d.document_id === docId)
          : null;

        if (!found) throw new Error("Document not found");
        if (!cancelled) setDoc(found);
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

  const statusLabel =
    doc?.status === "completed"
      ? "Completed"
      : doc?.status === "in_review"
      ? "In review"
      : "Uploaded";

  const statusStyles =
    doc?.status === "completed"
      ? "bg-emerald-100 text-emerald-800"
      : doc?.status === "in_review"
      ? "bg-amber-100 text-amber-800"
      : "bg-slate-100 text-slate-800";

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <Nav />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Document details
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              This is the analysis hub for one document (summary + key fields +
              flags). We’ll wire real output next.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Back to dashboard
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

                <span
                  className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${statusStyles}`}
                >
                  {statusLabel}
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <PlaceholderCard
                  title="Summary"
                  sub="Plain-English explanation of what matters most."
                  status={doc.status}
                />
                <PlaceholderCard
                  title="Key dates & fees"
                  sub="Deposits, late fees, notice windows, renewal terms."
                  status={doc.status}
                />
                <PlaceholderCard
                  title="Flags & questions"
                  sub="Potential risk areas + questions to ask before signing."
                  status={doc.status}
                />
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                  <h3 className="text-base font-semibold text-slate-900">
                    Next actions
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    This will become your “do this next” checklist per document.
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
                  </div>

                  <p className="mt-4 text-xs text-slate-500">
                    Non-legal summaries for clarity. For legal decisions, consult
                    a qualified professional.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function PlaceholderCard({
  title,
  sub,
  status,
}: {
  title: string;
  sub: string;
  status: "uploaded" | "in_review" | "completed";
}) {
  const isDone = status === "completed";
  const isReview = status === "in_review";

  const label = isDone
    ? "Ready"
    : isReview
    ? "Processing"
    : "Queued";

  const pill =
    isDone
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
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${pill}`}>
          {label}
        </span>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
        {status === "completed" ? (
          <div>
            Placeholder: display real output here when backend is wired.
          </div>
        ) : (
          <div>
            Not ready yet — once processing completes, the real content will appear
            here automatically.
          </div>
        )}
      </div>
    </div>
  );
}
