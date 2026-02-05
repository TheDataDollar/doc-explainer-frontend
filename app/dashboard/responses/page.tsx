// app/dashboard/responses/page.tsx
"use client";

import Nav from "../../components/Nav";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

      let parsed: any = [];
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = [];
      }
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
  } catch {
    // ignore
  }

  items.sort((a, b) => {
    const ad = new Date(a.createdAt).getTime();
    const bd = new Date(b.createdAt).getTime();
    return (isNaN(bd) ? 0 : bd) - (isNaN(ad) ? 0 : ad);
  });

  return items;
}

function markDocRead(docId: number) {
  try {
    const key = `docResponses:${docId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    const updated = parsed.map((e: any) => ({ ...e, isNew: false }));
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

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

  const newCount = useMemo(() => items.filter((i) => i.isNew).length, [items]);

  const visible = useMemo(() => {
    return filter === "new" ? items.filter((i) => i.isNew) : items;
  }, [items, filter]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <Nav />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              Dashboard • Inbox
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              Responses inbox
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Where updates land. Jump into the document hub to resolve items.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
              <button
                onClick={() => setFilter("new")}
                className={cn(
                  "px-4 py-2 text-sm font-semibold",
                  filter === "new"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                New
                {newCount > 0 ? (
                  <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                    {newCount}
                  </span>
                ) : null}
              </button>
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "px-4 py-2 text-sm font-semibold",
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
              Document history
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h2 className="text-base font-semibold text-slate-900">Overview</h2>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">New updates</span>
                  <span className="font-semibold text-slate-900">{newCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total items</span>
                  <span className="font-semibold text-slate-900">{items.length}</span>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Frontend-only inbox. Once backend is wired, this becomes real notifications + change tracking.
              </p>
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
              <div className="font-semibold">Workflow</div>
              <div className="mt-1 text-emerald-800/90">
                Inbox → open doc hub → resolve → export/share
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-2">
            {visible.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                <div className="text-base font-semibold text-slate-900">
                  {filter === "new" ? "No new responses" : "No responses yet"}
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Upload documents and updates will appear here.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/upload"
                    className="inline-flex rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                  >
                    Upload a document
                  </Link>
                  <Link
                    href="/dashboard/history"
                    className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                  >
                    View documents
                  </Link>
                </div>
              </div>
            ) : (
              visible.map((i, idx) => (
                <div
                  key={`${i.docId}-${i.createdAt}-${idx}`}
                  className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <KindPill kind={i.kind} />
                        {i.isNew ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                            New
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-2 text-sm font-semibold text-slate-900">
                        {i.title}
                      </div>

                      {i.body ? (
                        <div className="mt-1 whitespace-pre-wrap text-sm text-slate-700 line-clamp-3">
                          {i.body}
                        </div>
                      ) : null}

                      <div className="mt-3 text-xs text-slate-500">
                        Doc ID:{" "}
                        <span className="font-semibold text-slate-700">{i.docId}</span>
                        <span className="mx-2 text-slate-300">•</span>
                        {prettyDate(i.createdAt)}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/dashboard/history/${i.docId}`}
                        onClick={() => markDocRead(i.docId)}
                        className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                      >
                        Open document
                      </Link>

                      {i.isNew ? (
                        <button
                          onClick={() => {
                            markDocRead(i.docId);
                            setItems(loadAllInboxItems());
                          }}
                          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                        >
                          Mark read
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

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
