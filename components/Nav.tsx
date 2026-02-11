"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function getInboxNewCount(): number {
  try {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("docResponses:")) continue;

      const raw = localStorage.getItem(key);
      if (!raw) continue;

      let events: any[] = [];
      try {
        events = JSON.parse(raw);
      } catch {
        events = [];
      }

      if (!Array.isArray(events)) continue;
      for (const e of events) if (e?.isNew) count += 1;
    }
    return count;
  } catch {
    return 0;
  }
}

type NavItem = { href: string; label: string; badge?: number };

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inboxNew, setInboxNew] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const userRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    const refresh = () => setInboxNew(getInboxNewCount());
    refresh();
    const t = window.setInterval(refresh, 2000);
    return () => window.clearInterval(t);
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
    setUserOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!userRef.current) return;
      if (!userRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  function isActive(href: string) {
    return pathname?.startsWith(href);
  }

  /* ---------- NAV DEFINITIONS ---------- */

  const loggedOutLinks: NavItem[] = [
    { href: "/", label: "Home" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/support", label: "Support" },
    { href: "/login", label: "Login" },
  ];

  const loggedInLinks: NavItem[] = useMemo(
    () => [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/upload", label: "Upload" },
      { href: "/dashboard/history", label: "History" },
      {
        href: "/dashboard/responses",
        label: "Responses",
        badge: inboxNew,
      },
      { href: "/settings", label: "Settings" },
    ],
    [inboxNew]
  );

  const navLinks = isLoggedIn ? loggedInLinks : loggedOutLinks;

  return (
    <header className="relative md:sticky md:top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 md:px-6 md:py-4">
        {/* Brand */}
        <Link
          href={isLoggedIn ? "/dashboard" : "/"}
          className="flex items-center gap-3"
        >
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <span className="text-sm font-black">RE</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Real Estate Explainer
            </div>
            <div className="text-xs text-slate-500">
              Leases • HOAs • Closing docs
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-medium text-slate-600 hover:text-slate-900",
                isActive(l.href) &&
                  "text-slate-900 font-semibold underline underline-offset-[18px] decoration-emerald-300"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link
                href="/upload"
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                New upload
              </Link>

              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserOpen((v) => !v)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white"
                >
                  ⋯
                </button>

                {userOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-lg">
                    <Link
                      href="/settings"
                      className="block px-4 py-2.5 text-sm hover:bg-slate-50"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/register"
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Try it free
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block rounded-xl px-3 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                {l.label}
              </Link>
            ))}

            {!isLoggedIn && (
              <Link
                href="/register"
                className="mt-4 block rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Try it free (3 docs)
              </Link>
            )}

            {isLoggedIn && (
              <button
                onClick={logout}
                className="mt-3 w-full rounded-xl bg-rose-50 px-4 py-3 text-left text-sm font-semibold text-rose-700"
              >
                Log out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
