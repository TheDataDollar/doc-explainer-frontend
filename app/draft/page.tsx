"use client";

import Nav from "../../components/Nav";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

function safeFromParam(): string {
  try {
    const qs = new URLSearchParams(window.location.search);
    return qs.get("from") || "";
  } catch {
    return "";
  }
}

export default function DraftPage() {
  const router = useRouter();

  const [from, setFrom] = useState<string>("");

  const [settings, setSettings] = useState<DraftSettings>({});
  const [draftType, setDraftType] = useState("Lease Addendum");
  const [draftTypeOther, setDraftTypeOther] = useState("");
  const [partyNames, setPartyNames] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const isOther = draftType === "Other…";
  const finalDraftType = useMemo(() => {
    if (!isOther) return draftType;
    return draftTypeOther.trim() ? draftTypeOther.trim() : "Other";
  }, [draftType, draftTypeOther, isOther]);

  useEffect(() => {
    // require login
    const t = localStorage.getItem("token");
    if (!t) {
      router.push("/login");
      return;
    }

    setFrom(safeFromParam());

    // load builder settings from upload page
    try {
      const raw = localStorage.getItem("outputBuilder");
      if (raw) setSettings(JSON.parse(raw));
    } catch {
      setSettings({});
    }
  }, [router]);

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
              Separate workflow from analysis. (We’ll wire generation next.)
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

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Left: builder */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-900">
                Draft Builder
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Pick a draft type, enter key details, and we’ll generate a structured draft.
              </p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-800">
                    Draft type
                  </label>
                  <select
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100"
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
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100"
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
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100"
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
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100"
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
                    className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Ex: Add late fee clause, add renewal window, include notice period, etc."
                  />
                </div>
              </div>

              <button
                onClick={() => alert("Next step: wire AI generation here.")}
                className="mt-6 w-full rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Generate draft (coming next)
              </button>

              <p className="mt-3 text-xs text-slate-500">
                We’ll add safe legal disclaimers + state-aware templates.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h3 className="text-base font-semibold text-slate-900">Preview</h3>
              <p className="mt-1 text-sm text-slate-600">
                Placeholder preview block to make it feel premium.
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
                Using your Output Builder settings
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Saved from Upload (so the experience feels connected).
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
              <div className="font-semibold">Premium feel checklist</div>
              <div className="mt-1 text-emerald-800/90">
                Separate page ✅ • Connected settings ✅ • Preview ✅ • Next: templates & export ✅
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
