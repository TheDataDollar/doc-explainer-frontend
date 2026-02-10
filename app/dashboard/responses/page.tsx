"use client";

import Nav from "../../../components/Nav";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/* ---------- Types ---------- */

type ResponseEvent = {
  id: string;
  kind: "system" | "ai" | "user";
  title: string;
  body?: string;
  createdAt: string;
  isNew?: boolean;
};

type InboxItem = {
  docId: number;
  title: string;
  body?: string;
  createdAt: string;
  isNew: boolean;
  kind: ResponseEvent["kind"];
};

/* ---------- Utils ---------- */

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

function parseDocIdFromKey(key: string): number | null {
  const m = key.match(/^docResponses:(\d+)$/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function loadAllInboxItems(): InboxItem[] {
  const items: InboxItem[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const docId = parseDocIdFromKey(key);
      if (!docId) continue;

      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) continue;

      for (const e of parsed as ResponseEvent[]) {
        if (!e?.title || !e?.createdAt) continue;
        items.push({
          docId,
          title: e.title,
          body: e.body,
          createdAt: e.createdAt,
          isNew: !!e.isNew,
          kind: e.kind || "system",
        });
      }
    }
  } catch {}

  return items.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function markDocRead(docId: number) {
  try {
    const key = `docResponses:${docId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    localStorage.setItem(
      key,
      JSON.stringify(parsed.map((e: any) => ({ ...e, isNew: false })))
    );
  } catch {}
}

/* ---------- Page ---------- */

export default function ResponsesInboxPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [filter, setFilter] = useState<"new" | "all">("new");

  useEffect(() => {
    setItems(loadAllInboxItems());
    const t = window.setInterval(() => {
      setItems(loadAllInboxItems());
    }, 2000);
    return () => window.clearInterval(t);
  }, []);

  const newCount = useMemo(
    () => items.filter((i) => i.isNew).length,
    [items]
  );

  const visible = useMemo(() => {
    return filter === "new" ? items.filter((i) => i.isNew) : items;
  }, [items, filter]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <Nav />

      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            Dashboard • Responses
          </div>

          <h1 className="mt-4 text-3xl font-semibold text-slate-900">
            Document updates
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            This inbox shows important updates and notes for your documents.
            Click an item to open the document and review it.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <div className="inline-flex overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
            <button
              onClick={() => setFilter("new")}
              className={cn(
                "px-5 py-2 text-sm font-semibold",
                filter === "new"
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-50"
              )}
            >
              New
              {newCount > 0 && (
                <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                  {newCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-5 py-2 text-sm font-semibold",
                filter === "all"
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-50"
              )}
            >
              All
            </button>
          </div>

          <Link
            href="/dashboard/history"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
          >
            View all documents
          </Link>
        </div>

        {/* Inbox */}
        {visible.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-10 text-center shadow-sm backdrop-blur">
            <h3 className="text-lg font-semibold text-slate-900">
              {filter === "new" ? "No new updates" : "No updates yet"}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Upload a document and updates will appear here as they’re generated.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/upload"
                className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Upload a document
              </Link>
              <Link
                href="/dashboard/history"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
              >
                Browse documents
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((i, idx) => (
              <div
                key={`${i.docId}-${i.createdAt}-${idx}`}
                className={cn(
                  "rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur transition",
                  i.isNew
                    ? "border-emerald-200"
                    : "border-slate-200"
                )}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <KindPill kind={i.kind} />
                      {i.isNew && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                          New
                        </span>
                      )}
                    </div>

                    <div className="mt-2 text-sm font-semibold text-slate-900">
                      {i.title}
                    </div>

                    {i.body && (
                      <div className="mt-1 text-sm text-slate-600 line-clamp-2">
                        {i.body}
                      </div>
                    )}

                    <div className="mt-2 text-xs text-slate-500">
                      Document #{i.docId} • {prettyDate(i.createdAt)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/history/${i.docId}`}
                      onClick={() => markDocRead(i.docId)}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                    >
                      Open document
                    </Link>

                    {i.isNew && (
                      <button
                        onClick={() => {
                          markDocRead(i.docId);
                          setItems(loadAllInboxItems());
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

/* ---------- UI Bits ---------- */

function KindPill({ kind }: { kind: "system" | "ai" | "user" }) {
  const cls =
    kind === "ai"
      ? "bg-slate-900 text-white"
      : kind === "user"
      ? "bg-white border border-slate-200 text-slate-700"
      : "bg-emerald-50 border border-emerald-200 text-emerald-900";

  const label = kind === "ai" ? "AI" : kind === "user" ? "You" : "System";

  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", cls)}>
      {label}
    </span>
  );
}
