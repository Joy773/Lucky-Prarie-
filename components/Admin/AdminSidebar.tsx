"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/products", label: "All Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/drivers", label: "Drivers" },
] as const;

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-slate-50"
      aria-label="Admin"
    >
      <div className="border-b border-slate-200 px-4 py-4">
        <p className="text-sm font-bold text-fuchsia-600">Lucky Prarie</p>
        <p className="text-xs text-slate-500">Admin</p>
      </div>
      <nav className="flex-1 p-2">
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
      </nav>
    </aside>
  );
}
