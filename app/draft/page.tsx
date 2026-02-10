"use client";

import Nav from "@/components/Nav";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type DraftSettings = {
  docType?: string;
  role?: string;
  state?: string;
  propertyType?: string;
  outputMode?: string;
  tone?: string;
  depth?: string;
  extractKeyFields?: boolean;
  highlightClauses?: boolean;
  includeQuestions?: boolean;
};

type MeResponse = {
  user_id: number;
  email: string;
  free_docs_used: number;
  is_paid: boolean;
};

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function DraftPage() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "";

  const API =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://doc-explainer-api.onrender.com";

  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<DraftSettings>({});
  const [draftType, setDraftType] = useState("Lease Addendum");
  const [draftTypeOther, setDraftTypeOther] = useState("");
  const [partyNames, setPartyNames] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const isOther = draftType === "Other…";
  const finalDraftType = useMemo(() => {
    if (!isOther) return draftType;
    return draftTypeOther.trim() ? draftTypeOther.trim() : "Other";
  }, [draftType, draftTypeOther, isOther]);

  const isPaid = !!me?.is_paid;

  const draftOptions = [
    "Lease Addendum",
    "Notice to Cure",
    "HOA Request Letter",
    "Closing Summary",
    "Other…",
  ];

  const backLabel =
    from === "dashboard"
      ? "Back to dashboard"
      : from === "upload"
      ? "Back to upload"
      : "Back";

  const backHref =
    from === "dashboard" ? "/dashboard" : from === "upload" ? "/upload" : "/upload";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // load outputBuilder settings (optional)
    try {
      const raw = localStorage.getItem("outputBuilder");
      if (raw) setSettings(JSON.parse(raw));
    } catch {
      setSettings({});
    }

    let cancelled = false;

    async function loadMe() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = (await res.json().catch(() => ({}))) as Partial<MeResponse>;

        if (!res.ok) {
          throw new Error((data as any)?.detail || "Failed to load account");
        }

        const meData: MeResponse = {
          user_id: Number(data.user_id),
          email: String(data.email || ""),
          free_docs_used: Number(data.free_docs_used ?? 0),
          is_paid: !!data.is_paid,
        };

        if (cancelled) return;

        setMe(meData);

        // ✅ Hard lock: if not paid, open upgrade modal immediately
        if (!meData.is_paid) {
          setUpgradeOpen(true);
        }
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMe();

    return () => {
      cancelled = true;
    };
  }, [API, router]);

  function handleGenerate() {
    // ✅ HARDLOCK - never allow draft generation if not paid
    if (!isPaid) {
      setUpgradeOpen(true);
      return;
    }

    alert(
      "Next step: wire AI generation here.\n\n(Paid gating is enforced by /me is_paid.)"
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <Nav />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              Draft Mode • Templates + Clauses
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              Draft a real-estate document
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Pro feature — drafting is available to paid members.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(backHref)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              {backLabel}
            </button>

            <button
              onClick={() => router.push("/upload")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Upload another
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-5 text-sm text-slate-600 shadow-sm">
            Loading your account…
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Plan banner */}
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">
                    Drafting availability
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {isPaid ? (
                      <>Paid plan active — drafting is unlocked.</>
                    ) : (
                      <>
                        Drafting is locked on Free. Upgrade to access Draft Document.
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      isPaid
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-800"
                    )}
                  >
                    {isPaid ? "Pro (Paid)" : "Free"}
                  </span>

                  <Link
                    href="/pricing"
                    className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                  >
                    Upgrade
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              {/* Left: builder */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Draft Builder
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        Pick a draft type, enter key details, and generate a structured draft.
                      </p>
                    </div>

                    {!isPaid ? (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                        🔒 Locked
                      </span>
                    ) : null}
                  </div>

                  <div className={cn("mt-6 grid gap-6 md:grid-cols-2", !isPaid && "opacity-60")}>
                    <div>
                      <label className="text-sm font-semibold text-slate-800">
                        Draft type
                      </label>
                      <select
                        disabled={!isPaid}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed"
                        value={draftType}
                        onChange={(e) => setDraftType(e.target.value)}
                      >
                        {draftOptions.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>

                      {draftType === "Other…" && (
                        <input
                          disabled={!isPaid}
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed"
                          value={draftTypeOther}
                          onChange={(e) => setDraftTypeOther(e.target.value)}
                          placeholder="Type the draft you need (ex: Pet addendum, Lease renewal, etc.)"
                        />
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-800">
                        Parties
                      </label>
                      <input
                        disabled={!isPaid}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed"
                        value={partyNames}
                        onChange={(e) => setPartyNames(e.target.value)}
                        placeholder="Ex: John Smith (Landlord), Jane Doe (Tenant)"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Property address (optional)
                      </label>
                      <input
                        disabled={!isPaid}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed"
                        value={propertyAddress}
                        onChange={(e) => setPropertyAddress(e.target.value)}
                        placeholder="123 Main St, City, State"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-slate-800">
                        Special instructions
                      </label>
                      <textarea
                        disabled={!isPaid}
                        className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed"
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="Ex: Add late fee clause, add renewal window, include notice period, etc."
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    className={cn(
                      "mt-6 w-full rounded-2xl py-3 text-sm font-semibold shadow-sm",
                      !isPaid
                        ? "bg-slate-200 text-slate-700 hover:bg-slate-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    )}
                  >
                    {!isPaid ? "Drafting requires an upgrade" : "Generate draft (coming next)"}
                  </button>

                  <p className="mt-3 text-xs text-slate-500">
                    Draft outputs are non-legal templates for clarity and speed. For legal decisions, consult a qualified professional.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                  <h3 className="text-base font-semibold text-slate-900">Preview</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Premium preview panel (placeholder).
                  </p>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
                    <div className="font-semibold text-slate-900">
                      Draft: {finalDraftType}
                    </div>
                    <div className="mt-2 text-slate-600">
                      Parties: {partyNames || "—"}
                    </div>
                    <div className="text-slate-600">
                      Address: {propertyAddress || "—"}
                    </div>
                    <div className="mt-3 text-slate-600">
                      Instructions: {specialInstructions || "—"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: carry settings */}
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                  <h3 className="text-base font-semibold text-slate-900">
                    Output Builder settings
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Connected from Upload to keep a consistent workflow.
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-slate-700">
                    <div>
                      <span className="font-semibold">Doc type:</span>{" "}
                      {settings.docType || "—"}
                    </div>
                    <div>
                      <span className="font-semibold">Role:</span>{" "}
                      {settings.role || "—"}
                    </div>
                    <div>
                      <span className="font-semibold">State:</span>{" "}
                      {settings.state || "—"}
                    </div>
                    <div>
                      <span className="font-semibold">Property:</span>{" "}
                      {settings.propertyType || "—"}
                    </div>
                    <div>
                      <span className="font-semibold">Tone:</span>{" "}
                      {settings.tone || "—"}
                    </div>
                    <div>
                      <span className="font-semibold">Depth:</span>{" "}
                      {settings.depth || "—"}
                    </div>
                  </div>

                  <button
                    onClick={() => router.push("/upload")}
                    className="mt-5 w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                  >
                    Adjust settings
                  </button>
                </div>

                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
                  <div className="font-semibold">Pro plan value</div>
                  <div className="mt-1 text-emerald-800/90">
                    Draft Document • Unlimited uploads • Built for serious real estate workflows
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {upgradeOpen && !loading && (
        <UpgradeModal onClose={() => setUpgradeOpen(false)} />
      )}
    </main>
  );
}

function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/35"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              🔒 Pro feature
            </div>
            <h3 className="mt-3 text-xl font-semibold text-slate-900">
              Draft Document is locked on Free
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Upgrade to Pro to draft real-estate documents with templates and clause structure.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="text-sm font-semibold text-slate-900">Pro includes</div>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            <li>• Draft Document tool</li>
            <li>• Unlimited uploads</li>
            <li>• Faster workflow + priority support</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/pricing"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 sm:w-auto"
          >
            Upgrade
          </Link>

          <button
            onClick={onClose}
            className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 sm:w-auto"
          >
            Not now
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Draft outputs are non-legal templates. For legal decisions, consult a qualified professional.
        </p>
      </div>
    </div>
  );
}
