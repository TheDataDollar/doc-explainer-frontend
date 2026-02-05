import Nav from "../../components/Nav";
import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <Nav />

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-10 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold tracking-widest text-emerald-700">
            TERMS
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Terms & conditions (plain-English)
          </h1>

          <p className="mt-5 max-w-3xl text-base text-slate-600 md:text-lg">
            Real Estate Explainer provides informational summaries and highlights
            to help users understand real estate documents faster. We are not a
            law firm and do not provide legal advice.
          </p>

          <div className="mt-10 space-y-6 text-sm text-slate-700">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Not legal advice
              </h3>
              <p className="mt-2 text-slate-600">
                Outputs are for clarity and organization only. For legal
                decisions, consult a licensed attorney or qualified professional.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Your responsibility
              </h3>
              <p className="mt-2 text-slate-600">
                You are responsible for reviewing your documents and verifying
                details. If something is unclear or high-stakes, seek professional
                help.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Service availability
              </h3>
              <p className="mt-2 text-slate-600">
                We may update features, limits, or pricing over time. We aim to
                keep the service reliable, but we can’t guarantee uninterrupted
                availability in every situation.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/privacy"
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              View Privacy
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
