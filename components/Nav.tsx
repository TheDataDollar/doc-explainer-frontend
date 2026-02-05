// components/Nav.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function getInboxNewCount(): number {
  try {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("docResponses:")) continue;

      const raw = localStorage.getItem(key);
      if (!raw) continue;

      let events: any = [];
      try {
        events = JSON.parse(raw);
      } catch {
        events = [];
      }
      if (!Array.isArray(events)) continue;

      for (const e of events) {
        if (e?.isNew) count += 1;
      }
    }
    return count;
  } catch {
    return 0;
  }
}

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inboxNew, setInboxNew] = useState(0);

  useEffect(() => {
    // token determines "logged in" nav items
    setIsLoggedIn(!!localStorage.getItem("token"));

    const refresh = () => setInboxNew(getInboxNewCount());
    refresh();

    const t = window.setInterval(refresh, 2000);
    return () => window.clearInterval(t);
  }, [pathname]);

  function logout() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/login");
  }

  const linkBase =
    "text-sm text-slate-600 hover:text-slate-900 transition-colors";
  const activeLink = "text-slate-900 font-semibold";

  return (
    <header
      data-nav-version="NAV-2026-02-05-LOCKIN"
      className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/75 backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <span className="text-sm font-black">RE</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">
              Real Estate Explainer
            </div>
            <div className="text-xs text-slate-500">Leases • HOAs • Closing docs</div>
          </div>
        </Link>

        {/* Links */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className={`${linkBase} ${pathname === "/" ? activeLink : ""}`}
          >
            Home
          </Link>

          <Link
            href="/pricing"
            className={`${linkBase} ${pathname?.startsWith("/pricing") ? activeLink : ""}`}
          >
            Pricing
          </Link>

          <Link
            href="/about"
            className={`${linkBase} ${pathname?.startsWith("/about") ? activeLink : ""}`}
          >
            About
          </Link>

          <Link
            href="/support"
            className={`${linkBase} ${pathname?.startsWith("/support") ? activeLink : ""}`}
          >
            Support
          </Link>

          {isLoggedIn && (
            <>
              <Link
                href="/dashboard"
                className={`${linkBase} ${
                  pathname?.startsWith("/dashboard") &&
                  !pathname?.startsWith("/dashboard/responses")
                    ? activeLink
                    : ""
                }`}
              >
                Dashboard
              </Link>

              {/* ✅ THIS IS THE INBOX LINK */}
              <Link
                href="/dashboard/responses"
                className={`${linkBase} ${pathname?.startsWith("/dashboard/responses") ? activeLink : ""}`}
              >
                <span className="inline-flex items-center gap-2">
                  Inbox
                  {inboxNew > 0 ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                      {inboxNew}
                    </span>
                  ) : null}
                </span>
              </Link>

              <Link
                href="/upload"
                className={`${linkBase} ${pathname?.startsWith("/upload") ? activeLink : ""}`}
              >
                Upload
              </Link>

              <Link
                href="/draft"
                className={`${linkBase} ${pathname?.startsWith("/draft") ? activeLink : ""}`}
              >
                Draft
              </Link>
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50 md:inline-flex"
              >
                Go to dashboard
              </Link>

              <button
                onClick={logout}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
              >
                Try it free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
