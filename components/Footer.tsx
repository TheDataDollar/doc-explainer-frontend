import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-14 border-t border-slate-200/70 bg-white/60 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                <span className="text-sm font-black">RE</span>
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-slate-900">
                  Real Estate Explainer
                </div>
                <div className="text-xs text-slate-500">
                  Leases • HOAs • Closing docs
                </div>
              </div>
            </div>

            <p className="mt-4 max-w-sm text-sm text-slate-600">
              Understand real estate documents faster with clear summaries, key
              dates, and attention flags — without digging through legal-style
              language.
            </p>

            <p className="mt-4 text-xs text-slate-500">
              Non-legal summaries for clarity. For legal decisions, consult a
              qualified professional.
            </p>
          </div>

          {/* Links */}
          <div>
            <div className="text-sm font-semibold text-slate-900">Product</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/pricing" className="hover:text-slate-900">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-slate-900">
                  About
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-slate-900">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-slate-900">
                  Create account
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-slate-900">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust / Legal */}
          <div>
            <div className="text-sm font-semibold text-slate-900">Trust</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/privacy" className="hover:text-slate-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-slate-900">
                  Terms & Conditions
                </Link>
              </li>
            </ul>

            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-900">
              <div className="font-semibold">Tip</div>
              <div className="mt-1 text-emerald-800/90">
                For leases, try <b>Red Flags + Risk Score</b> with <b>Deep</b>{" "}
                for maximum clarity.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200/70 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} Real Estate Explainer. All rights
            reserved.
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            <span>Built for speed & clarity.</span>
            <span className="hidden md:inline">•</span>
            <span>Not legal advice.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
