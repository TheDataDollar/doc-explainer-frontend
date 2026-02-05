import Nav from "../../components/Nav";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-white">
      <Nav />

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-10 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold tracking-widest text-emerald-700">
            PRIVACY
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Privacy you can understand.
          </h1>
          <p className="mt-5 max-w-3xl text-base text-slate-600 md:text-lg">
            Real Estate Explainer is built to help you understand documents —
            not to profit from your data. This page explains what we collect,
            how we use it, and what you control.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                What we collect
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>• Account basics (email + login info)</li>
                <li>• Documents you upload (so we can process them)</li>
                <li>• Usage signals (uploads and statuses) to power the dashboard</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                What we do NOT do
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>• We don’t sell your documents</li>
                <li>• We don’t publish your documents</li>
                <li>• We don’t share your documents with other users</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Your control</p>
            <p className="mt-2 text-slate-600">
              You decide what you upload. If a document is sensitive, treat it
              like sensitive data. For legal decisions, consult a qualified
              professional.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/terms"
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              View Terms
            </Link>
            <Link
              href="/support"
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
            >
              Contact support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
