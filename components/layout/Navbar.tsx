"use client";

import Link from "next/link";
import { FiShoppingCart } from "react-icons/fi";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { useAppSelector } from "@/store/hooks";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/orders", label: "Orders" },
] as const;

export default function Navbar() {
  const cartItemCount = useAppSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  return (
    <nav
      className="hidden border-b border-foreground/10 bg-background lg:block"
      aria-label="Main"
    >
      <SectionWrapper className="flex items-center justify-between gap-4 !py-3">
        <Link href="/" className="min-w-[190px] leading-tight">
          <p className="text-2xl font-bold text-fuchsia-600">Lucky Prarie</p>
          <p className="text-[11px] text-foreground/65">
            Premium alcohol delivered in Saskatoon
          </p>
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <ul className="flex items-center gap-1 sm:gap-2">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block rounded-md px-3 py-2 text-md text-foreground transition-colors hover:bg-foreground/5"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

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
        </div>
      </SectionWrapper>
    </nav>
  );
}
