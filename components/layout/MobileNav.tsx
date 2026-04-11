"use client";

import Link from "next/link";
import { useState } from "react";
import { FiMenu, FiShoppingCart, FiX } from "react-icons/fi";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { useAppSelector } from "@/store/hooks";

const mobileNavLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/orders", label: "Orders" },
] as const;

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const cartItemCount = useAppSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  return (
    <nav className="border-b border-foreground/10 bg-background lg:hidden" aria-label="Mobile">
      <SectionWrapper className="flex items-center justify-between py-3">
        <Link href="/" className="leading-tight">
          <p className="text-xl font-bold text-fuchsia-600">Lucky Prarie</p>
          <p className="text-[11px] text-foreground/65">
            Premium alcohol delivered in Saskatoon
          </p>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            aria-label={
              cartItemCount > 0
                ? `Cart, ${cartItemCount} ${cartItemCount === 1 ? "item" : "items"}`
                : "Cart"
            }
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-foreground/15 text-foreground transition-colors hover:bg-foreground/5"
          >
            <FiShoppingCart className="text-base" />
            {cartItemCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-fuchsia-600 px-1 text-[10px] font-semibold leading-none text-white tabular-nums">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-foreground/15 text-foreground transition-colors hover:bg-foreground/5"
          >
            {isOpen ? <FiX className="text-lg" /> : <FiMenu className="text-lg" />}
          </button>
        </div>
      </SectionWrapper>

      {isOpen && (
        <SectionWrapper className="border-t border-foreground/10 py-2">
          <ul>
            {mobileNavLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-foreground/5"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </SectionWrapper>
      )}
    </nav>
  );
}
