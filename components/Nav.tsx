// components/Nav.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inboxNew, setInboxNew] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));

    const refresh = () => setInboxNew(getInboxNewCount());
    refresh();

    const t = window.setInterval(refresh, 2000);
    return () => window.clearInterval(t);
  }, [pathname]);

  // close the mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function logout() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/login");
  }

  const linkBase =
    "text-sm text-slate-600 hover:text-slate-900 transition-colors";
  const activeLink = "text-slate-900 font-semibold";

  const navLinks = useMemo(() => {
    const common = [
      { href: "/", label: "Home" },
      { href: "/pricing", label: "Pricing" },
      { href: "/about", label: "About" },
      { href: "/support", label: "Support" },
    ];

    const authed = [
      {
        href: "/dashboard",
        label: "Dashboard",
      },
      {
        href: "/dashboard/responses",
        label: "Responses",
        badge: inboxNew,
      },
      { href: "/upload", label: "Upload" },
      { href: "/draft", label: "Draft" },
    ];

    return isLoggedIn ? [...common, ...authed] : common;
  }, [isLoggedIn, inboxNew]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
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
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(linkBase, isActive(l.href) && activeLink)}
            >
              <span className="inline-flex items-center gap-2">
                {l.label}
                {"badge" in l && typeof l.badge === "number" && l.badge > 0 ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                    {l.badge}
                  </span>
                ) : null}
              </span>
            </Link>
          ))}
        </nav>

        {/* Actions (desktop) */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
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

        {/* Mobile button */}
        <div className="flex items-center gap-2 md:hidden">
          {isLoggedIn && inboxNew > 0 ? (
            <Link
              href="/dashboard/responses"
              className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800"
              aria-label="New responses"
            >
              {inboxNew} new
            </Link>
          ) : null}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-sm"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            {/* simple hamburger / close */}
            <span className="text-lg leading-none">{mobileOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen ? (
        <div className="md:hidden border-t border-slate-200/70 bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div className="grid gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-sm",
                    isActive(l.href)
                      ? "bg-emerald-50 text-slate-900 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    {l.label}
                    {"badge" in l && typeof l.badge === "number" && l.badge > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                        {l.badge}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-slate-300">›</span>
                </Link>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 text-center"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 text-center"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 text-center"
                  >
                    Try it free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
