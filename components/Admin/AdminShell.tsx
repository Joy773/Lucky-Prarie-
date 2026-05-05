"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { FiMenu } from "react-icons/fi";
import AdminSidebar from "@/components/Admin/AdminSidebar";

type AdminShellProps = {
  children: ReactNode;
};

export default function AdminShell({ children }: AdminShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) {
        setMobileNavOpen(false);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileNavOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="flex min-h-screen bg-white">
      <div className="hidden min-h-screen w-56 shrink-0 lg:block">
        <AdminSidebar />
      </div>

      {mobileNavOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px] lg:hidden"
            aria-label="Close menu"
            onClick={closeMobileNav}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex w-[min(17rem,88vw)] flex-col shadow-2xl lg:hidden">
            <AdminSidebar
              onNavigate={closeMobileNav}
              onMobileClose={closeMobileNav}
            />
          </div>
        </>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
            aria-expanded={mobileNavOpen}
            aria-controls="admin-mobile-nav"
            aria-label="Open admin menu"
          >
            <FiMenu className="text-xl" aria-hidden />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-fuchsia-600">Lucky Prarie</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
        </header>

        <div className="min-w-0 flex-1 p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
