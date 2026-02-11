// components/Nav.tsx
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
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setUserOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
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
  ];

  // ✅ FINAL logged-in nav (History restored, Settings last)
  const loggedInLinks: NavItem[] = useMemo(
    () => [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/upload", label: "Upload" },
      { href: "/draft", label: "Draft" },
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

  const linkBase =
    "text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors";
  const activeLink =
    "text-slate-900 font-semibold underline underline-offset-[18px] decoration-emerald-300";

  return (
    <header className="sticky top-0 z-50 w-full max-w-full overflow-x-clip border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
        {/* Brand */}
        <Link
          href={isLoggedIn ? "/dashboard" : "/"}
          className="flex min-w-0 items-center gap-3"
          aria-label="Real Estate Explainer"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <span className="text-sm font-black">RE</span>
          </div>

          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-semibold text-slate-900">
              Real Estate Explainer
            </div>
            <div className="truncate text-xs text-slate-500">
              Leases • HOAs • Closing docs
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex min-w-0 flex-1 items-center justify-center">
          <div className="flex min-w-0 items-center gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(linkBase, isActive(l.href) && activeLink)}
              >
                <span className="inline-flex items-center gap-2">
                  {l.label}
                  {typeof l.badge === "number" && l.badge > 0 ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                      {l.badge}
                    </span>
                  ) : null}
                </span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Right actions (desktop) */}
        <div className="hidden md:flex min-w-0 items-center justify-end gap-3">
          {isLoggedIn ? (
            <>
              <Link
                href="/upload"
                className="shrink-0 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                New upload
              </Link>

              <div className="relative shrink-0" ref={userRef}>
                <button
                  onClick={() => setUserOpen((v) => !v)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50"
                  aria-label="Open menu"
                  aria-expanded={userOpen}
                >
                  <span className="text-sm font-bold">⋯</span>
                </button>

                {userOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
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
            <>
              <Link
                href="/login"
                className="shrink-0 text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="shrink-0 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
              >
                Try it free
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden shrink-0">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <span className="text-lg leading-none">{mobileOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden w-full max-w-full overflow-x-clip border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {/* Main links */}
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
              >
                <span className="font-medium">{l.label}</span>
                {typeof l.badge === "number" && l.badge > 0 ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                    {l.badge}
                  </span>
                ) : null}
              </Link>
            ))}

            {/* Divider */}
            <div className="my-2 h-px w-full bg-slate-200/80" />

            {/* Mobile-only auth/actions */}
            {isLoggedIn ? (
              <>
                <Link
                  href="/upload"
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                >
                  <span>New upload</span>
                  <span className="text-emerald-600">＋</span>
                </Link>

                <button
                  onClick={logout}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                >
                  <span>Log out</span>
                  <span>→</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  <span>Login</span>
                  <span>→</span>
                </Link>

                <Link
                  href="/register"
                  className="flex w-full items-center justify-between rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  <span>Try it free</span>
                  <span>→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
