import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <Nav />

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-10 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold tracking-widest text-emerald-700">
            ABOUT US
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Real estate documents are confusing — we make them usable.
          </h1>

          <p className="mt-5 max-w-3xl text-base text-slate-600 md:text-lg">
            Real Estate Explainer helps you understand leases, HOA/condo rules,
            addendums, disclosures, and closing documents without getting lost in
            legal-style language.
            <br />
            <br />
            You upload a PDF and choose how you want it explained (tone, depth,
            and output type). We return a structured breakdown: what it says,
            what it means in plain English, what to watch for, and what to do
            next.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                Built for real workflows
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Designed around the docs people actually use: leases, HOA rules,
                addendums, estoppels, and closing packets.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                Clarity-first output
              </p>
              <p className="mt-2 text-sm text-slate-600">
                We highlight key deadlines, fees, and clauses that cause
                surprises — then translate them into plain English.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                Non-legal assistance
              </p>
              <p className="mt-2 text-sm text-slate-600">
                We’re not a law firm. We help you read faster and ask better
                questions — not replace legal advice.
              </p>
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-emerald-200 bg-emerald-50/60 p-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              What you get when you upload a document
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-slate-700">
              Output depends on what you select in the Output Builder, but the
              goal is always the same: make the document understandable and
              actionable.
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-emerald-200 bg-white/70 p-6">
                <p className="text-sm font-semibold text-slate-900">
                  Plain-English breakdown
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  A clear explanation of what each section means, without
                  legal-style language.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-white/70 p-6">
                <p className="text-sm font-semibold text-slate-900">
                  Key fields & timelines
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Important dates, fees, parties, notice windows, renewal rules,
                  and penalties.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-white/70 p-6">
                <p className="text-sm font-semibold text-slate-900">
                  Flags & questions
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Attention items + questions to ask before signing.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-slate-900">FAQ</h2>
            <div className="mt-6 space-y-4">
              <FaqItem
                q="Is this legal advice?"
                a="No. We provide non-legal summaries and highlights to help you understand documents faster. For legal advice or final decisions, consult a licensed attorney."
              />
              <FaqItem
                q="What types of documents work best?"
                a="Leases, addendums, HOA/condo rules, disclosures, and closing paperwork."
              />
              <FaqItem
                q="Analyze vs Draft — what’s the difference?"
                a="Analyze helps you understand an existing document you already have. Draft Mode helps you generate a structured draft (templates + clauses)."
              />
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
            >
              Try free (3 docs)
            </Link>

            <Link
              href="/pricing"
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              View pricing
            </Link>
          </div>

          <p className="mt-8 text-xs text-slate-500">
            Note: We provide clarity and highlights — not legal advice. For legal
            decisions, consult a qualified professional.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div className="text-sm font-semibold text-slate-900">{q}</div>
      <div className="mt-2 text-sm text-slate-600">{a}</div>
    </div>
  );
}
