"use client";

import Nav from "../../components/Nav";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MeResponse = {
  user_id: number;
  email: string;
  free_docs_used: number;
  is_paid: boolean;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

type OptionValue = string;

function withOther(options: string[]) {
  return [...options, "Other…"];
}

function normalizeOther(selected: string, custom: string) {
  if (selected !== "Other…") return selected;
  return custom.trim() ? custom.trim() : "Other";
}

export default function UploadPage() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const docTypeOptions = withOther([
    "Lease",
    "HOA/Condo",
    "Closing docs",
    "Addendum",
    "License/Disclosure",
  ]);
  const roleOptions = withOther([
    "Landlord",
    "Property Manager",
    "Real Estate Agent/Broker",
    "Tenant",
    "Investor",
  ]);
  const stateOptions = withOther(["FL", "GA", "NC", "SC", "TX", "CA", "NY", "AZ"]);
  const propertyTypeOptions = withOther([
    "Single-family",
    "Multi-family",
    "Condo",
    "Townhome",
    "Commercial",
  ]);
  const outputModeOptions = withOther([
    "Red Flags + Risk Score",
    "Executive Summary",
    "Action Checklist",
    "Client-ready Email",
    "Plain-English Breakdown",
  ]);
  const toneOptions = withOther([
    "Professional",
    "Plain-English",
    "Investor-focused",
    "Client-friendly",
  ]);
  const depthOptions = withOther(["Short", "Standard", "Deep"]);

  const [docType, setDocType] = useState<OptionValue>("Lease");
  const [docTypeOther, setDocTypeOther] = useState("");

  const [role, setRole] = useState<OptionValue>("Property Manager");
  const [roleOther, setRoleOther] = useState("");

  const [stateJurisdiction, setStateJurisdiction] = useState<OptionValue>("FL");
  const [stateOther, setStateOther] = useState("");

  const [propertyType, setPropertyType] = useState<OptionValue>("Single-family");
  const [propertyTypeOther, setPropertyTypeOther] = useState("");

  const [outputMode, setOutputMode] = useState<OptionValue>(
    "Red Flags + Risk Score"
  );
  const [outputModeOther, setOutputModeOther] = useState("");

  const [tone, setTone] = useState<OptionValue>("Professional");
  const [toneOther, setToneOther] = useState("");

  const [depth, setDepth] = useState<OptionValue>("Standard");
  const [depthOther, setDepthOther] = useState("");

  const [extractKeyFields, setExtractKeyFields] = useState(true);
  const [highlightClauses, setHighlightClauses] = useState(true);
  const [includeQuestions, setIncludeQuestions] = useState(true);

  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);

    fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setMe(data))
      .catch(() => setMe(null));
  }, [router]);

  const planLabel = useMemo(() => {
    if (!me) return "Loading…";
    return me.is_paid ? "Pro / Elite" : "Free";
  }, [me]);

  const fileLabel = useMemo(() => {
    if (!file) return "Drag & drop a PDF here, or click to browse";
    return `${file.name} • ${(file.size / 1024 / 1024).toFixed(2)} MB`;
  }, [file]);

  function saveBuilderToLocalStorage() {
    const payload = {
      docType: normalizeOther(docType, docTypeOther),
      role: normalizeOther(role, roleOther),
      state: normalizeOther(stateJurisdiction, stateOther),
      propertyType: normalizeOther(propertyType, propertyTypeOther),
      outputMode: normalizeOther(outputMode, outputModeOther),
      tone: normalizeOther(tone, toneOther),
      depth: normalizeOther(depth, depthOther),
      extractKeyFields,
      highlightClauses,
      includeQuestions,
    };

    localStorage.setItem("outputBuilder", JSON.stringify(payload));
  }

  function goToDraftPage() {
    saveBuilderToLocalStorage();
    router.push("/draft?from=upload");
  }

  async function handleUpload() {
    if (!token) return;
    if (me && !me.is_paid && me.free_docs_used >= 3) {
    setMessage("You’ve used all 3 free documents. Upgrade to keep analyzing without interruption.");
    setTimeout(() => router.push("/pricing"), 900);
      return;
}


    // ✅ Soft paywall check is in Step 5 (we’ll add later) — leaving upload clean for now.

    if (!file) {
      setMessage("Please choose a PDF first.");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      saveBuilderToLocalStorage();

      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`${API_BASE}/documents/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Upload failed");
      }

      await res.json();

      setMessage("✅ Uploaded! Next step: generate explanation output.");
      setTimeout(() => router.push("/dashboard"), 900);
    } catch (e: any) {
      setMessage("❌ " + (e?.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  }

  function SelectBlock(props: {
    label: string;
    value: string;
    setValue: (v: string) => void;
    options: string[];
    otherValue: string;
    setOtherValue: (v: string) => void;
    placeholder?: string;
  }) {
    const showOther = props.value === "Other…";

    return (
      <div>
        <label className="text-sm font-semibold text-slate-800">
          {props.label}
        </label>
        <select
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100"
          value={props.value}
          onChange={(e) => props.setValue(e.target.value)}
        >
          {props.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        {showOther && (
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-100"
            value={props.otherValue}
            onChange={(e) => props.setOtherValue(e.target.value)}
            placeholder={props.placeholder || "Type your custom value…"}
          />
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <Nav />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Real Estate Explainer • {planLabel}
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              Upload & Output Builder
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Get clear answers, risk flags, and client-ready summaries for leases,
              HOAs, and closing docs.
            </p>

            {/* ✅ Onboarding hint */}
            <p className="mt-2 text-sm text-slate-600">
              New here? Try uploading a <b>lease</b> or <b>HOA doc</b> first — those
              produce the strongest “wow” output.
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
              onClick={() => setFile(null)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Clear file
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1 */}
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Step 1 — Upload document
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    PDF only for now. The goal is speed + clarity.
                  </p>
                </div>

                {!me?.is_paid && me && (
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                    Free usage:{" "}
                    <span className="font-semibold">{me.free_docs_used}/3</span>
                  </div>
                )}
              </div>

              <label
                className={`mt-4 block cursor-pointer rounded-2xl border border-dashed p-10 text-center transition ${
                  dragOver
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-slate-300 bg-slate-50/80 hover:bg-slate-50"
                }`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(false);
                  const dropped = e.dataTransfer.files?.[0];
                  if (dropped) setFile(dropped);
                }}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />

                <div className="mx-auto flex max-w-xl flex-col items-center gap-3">
                  <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                    Smart parsing • Risk detection • Client-ready output
                  </div>

                  <div className="text-sm font-semibold text-slate-900">
                    {fileLabel}
                  </div>
                  <div className="text-xs text-slate-500">
                    Tip: If it’s a long doc, choose <b>Deep</b> + <b>Red Flags</b>.
                  </div>
                </div>
              </label>

              <button
                onClick={handleUpload}
                disabled={loading}
                className="mt-5 w-full rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? "Uploading…" : "Upload & continue"}
              </button>

              {message && (
                <p className="mt-3 text-sm text-slate-700">{message}</p>
              )}
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-900">
                Step 2 — Output Builder
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Choose exactly how you want the document explained.
              </p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <SelectBlock
                  label="Document type"
                  value={docType}
                  setValue={setDocType}
                  options={docTypeOptions}
                  otherValue={docTypeOther}
                  setOtherValue={setDocTypeOther}
                  placeholder="Ex: Lease addendum / Estoppel / Inspection report"
                />

                <SelectBlock
                  label="Your role"
                  value={role}
                  setValue={setRole}
                  options={roleOptions}
                  otherValue={roleOther}
                  setOtherValue={setRoleOther}
                  placeholder="Ex: HOA board member / Title agent / Attorney"
                />

                <SelectBlock
                  label="State"
                  value={stateJurisdiction}
                  setValue={setStateJurisdiction}
                  options={stateOptions}
                  otherValue={stateOther}
                  setOtherValue={setStateOther}
                  placeholder="Ex: NJ"
                />

                <SelectBlock
                  label="Property type"
                  value={propertyType}
                  setValue={setPropertyType}
                  options={propertyTypeOptions}
                  otherValue={propertyTypeOther}
                  setOtherValue={setPropertyTypeOther}
                  placeholder="Ex: Duplex / Short-term rental"
                />

                <SelectBlock
                  label="Output mode"
                  value={outputMode}
                  setValue={setOutputMode}
                  options={outputModeOptions}
                  otherValue={outputModeOther}
                  setOtherValue={setOutputModeOther}
                  placeholder="Ex: Renewal negotiation summary"
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <SelectBlock
                    label="Tone"
                    value={tone}
                    setValue={setTone}
                    options={toneOptions}
                    otherValue={toneOther}
                    setOtherValue={setToneOther}
                    placeholder="Ex: Extremely simple, 5th grade"
                  />

                  <SelectBlock
                    label="Depth"
                    value={depth}
                    setValue={setDepth}
                    options={depthOptions}
                    otherValue={depthOther}
                    setOtherValue={setDepthOther}
                    placeholder="Ex: Ultra-deep legal notes"
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Extract key fields
                    </div>
                    <div className="text-xs text-slate-500">
                      Dates, fees, parties, deposits
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={extractKeyFields}
                    onChange={(e) => setExtractKeyFields(e.target.checked)}
                    className="h-5 w-5 accent-emerald-600"
                  />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Highlight clauses
                    </div>
                    <div className="text-xs text-slate-500">
                      Renewal, termination, fees
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={highlightClauses}
                    onChange={(e) => setHighlightClauses(e.target.checked)}
                    className="h-5 w-5 accent-emerald-600"
                  />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Questions to ask
                    </div>
                    <div className="text-xs text-slate-500">
                      What to clarify before signing
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeQuestions}
                    onChange={(e) => setIncludeQuestions(e.target.checked)}
                    className="h-5 w-5 accent-emerald-600"
                  />
                </label>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  These settings carry forward automatically (Upload → Draft too).
                </p>

                <button
                  onClick={() => {
                    saveBuilderToLocalStorage();
                    setMessage("✅ Output Builder saved.");
                    setTimeout(() => setMessage(null), 1000);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                >
                  Save settings
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
              <h3 className="text-base font-semibold text-slate-900">
                Need a document drafted?
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Draft Mode is best when you don’t already have the doc yet —
                templates + clauses as a separate workflow.
              </p>

              <button
                onClick={goToDraftPage}
                className="mt-4 w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Open Draft Mode
              </button>

              <p className="mt-3 text-xs text-slate-500">
                Analyze = understand an existing doc. Draft = create a new one.
              </p>
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
              <div className="font-semibold">Pro Tip</div>
              <div className="mt-1 text-emerald-800/90">
                For leases, choose <b>Red Flags + Risk Score</b> + <b>Deep</b> to
                maximize value.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
