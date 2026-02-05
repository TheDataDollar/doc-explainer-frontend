// app/documents/history/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type DocRow = {
  document_id: number;
  original_filename: string;
  stored_filename: string;
  created_at: string;
  status: string;
};

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function formatDate(v: string) {
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

function statusMeta(status: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("complete"))
    return { label: "Completed", pill: "bg-emerald-100 text-emerald-800" };
  if (s.includes("review") || s.includes("process"))
    return { label: "In review", pill: "bg-amber-100 text-amber-800" };
  if (s.includes("upload"))
    return { label: "Uploaded", pill: "bg-slate-100 text-slate-800" };
  return { label: status || "Unknown", pill: "bg-slate-100 text-slate-800" };
}

export default function DocumentsHistoryPage() {
  const API =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://doc-explainer-api.onrender.com";

  const [token, setToken] = useState("");
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token") || "";
    setToken(t);
  }, []);

  async function loadDocs(t = token) {
    if (!t) return setMsg("No token found. Go to /auth and login first.");
    setLoading(true);
    setMsg("Loading documents…");

    try {
      const res = await fetch(`${API}/documents`, {
        headers: { Authorization: `Bearer ${t}` },
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(`${data.detail || "Failed to load documents."}`);
        setDocs([]);
        return;
      }

      const arr = Array.isArray(data) ? (data as DocRow[]) : [];
      setDocs(arr);
      setMsg(arr.length ? `Loaded ${arr.length} document(s).` : "No documents yet.");
    } catch (e) {
      console.error(e);
      setMsg("Failed to fetch (check API URL / token).");
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }

  const sorted = useMemo(() => {
    const copy = [...docs];
    copy.sort((a, b) => {
      const ad = new Date(a.created_at).getTime();
      const bd = new Date(b.created_at).getTime();
      return (isNaN(bd) ? 0 : bd) - (isNaN(ad) ? 0 : ad);
    });
    return copy;
  }, [docs]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              Documents • Activity
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              Document history
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Review uploads, open analysis hubs, and track document status in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => loadDocs()}
              disabled={loading}
              className={cn(
                "rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50",
                loading && "opacity-60 cursor-not-allowed"
              )}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>

            <Link
              href="/documents"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Upload
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Left: Token + status */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Session token
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Stored locally on this device. Needed to load your documents.
                  </p>
                </div>
                <Link
                  href="/auth"
                  className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Auth
                </Link>
              </div>

              <label className="mt-4 block text-sm font-semibold text-slate-800">
                Token
              </label>
              <input
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  localStorage.setItem("token", e.target.value);
                }}
                placeholder="Paste token here (saved in localStorage)"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100"
              />

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                {msg || "Click Refresh to load your document list."}
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
              <div className="font-semibold">Tip</div>
              <div className="mt-1 text-emerald-800/90">
                Use document status to prioritize what needs review and what is ready to share.
              </div>
            </div>
          </div>

          {/* Right: list */}
          <div className="lg:col-span-2 space-y-4">
            {sorted.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                <div className="text-base font-semibold text-slate-900">
                  No documents yet
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Upload a contract to begin analysis.
                </p>
                <div className="mt-4">
                  <Link
                    href="/documents"
                    className="inline-flex rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                  >
                    Upload a document
                  </Link>
                </div>
              </div>
            ) : (
              sorted.map((d) => {
                const meta = statusMeta(d.status);
                return (
                  <div
                    key={d.document_id}
                    className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="truncate text-lg font-semibold text-slate-900">
                            {d.original_filename}
                          </div>
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-semibold",
                              meta.pill
                            )}
                          >
                            {meta.label}
                          </span>
                        </div>

                        <div className="mt-2 text-sm text-slate-600">
                          <span className="font-semibold text-slate-700">ID:</span>{" "}
                          {d.document_id}
                          <span className="mx-2 text-slate-300">•</span>
                          <span className="font-semibold text-slate-700">
                            Uploaded:
                          </span>{" "}
                          {formatDate(d.created_at)}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/documents/history/${d.document_id}`}
                          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                        >
                          Open analysis hub
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
