"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FiLogOut } from "react-icons/fi";

const navItems = [
  { href: "/admin/products", label: "All Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/drivers", label: "Drivers" },
] as const;

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      router.push("/admin");
      router.refresh();
      setLoggingOut(false);
    }
  };

  return (
    <aside
      className="flex min-h-screen w-56 shrink-0 flex-col border-r border-slate-200 bg-slate-50"
      aria-label="Admin"
    >
      <div className="border-b border-slate-200 px-4 py-4">
        <p className="text-sm font-bold text-fuchsia-600">Lucky Prarie</p>
        <p className="text-xs text-slate-500">Admin</p>
      </div>
      <nav className="flex flex-1 flex-col p-2">
        <ul className="space-y-0.5">
          {navItems.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-fuchsia-100 text-fuchsia-900"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-auto border-t border-slate-200 pt-2">
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiLogOut className="text-base" aria-hidden />
            {loggingOut ? "Signing out…" : "Log out"}
          </button>
        </div>
      </nav>
    </aside>
  );
}
