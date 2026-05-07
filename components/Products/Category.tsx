"use client";

import {
  FiChevronDown,
  FiCoffee,
  FiGrid,
  FiPackage,
  FiShield,
  FiShoppingBag,
  FiStar,
} from "react-icons/fi";
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SectionWrapper from "@/components/layout/SectionWrapper";

const categories = [
  // Values must match `PRODUCT_CATEGORIES` in `models/products.ts`
  { label: "Spirits", value: "Spirits", Icon: FiStar },
  { label: "Beer", value: "Beer", Icon: FiCoffee },
  { label: "Wine", value: "Wine", Icon: FiStar },
  { label: "Ciders & seltzers", value: "Ciders & seltzers", Icon: FiPackage },
  { label: "Mix & chips", value: "Mix & chips", Icon: FiShoppingBag },
  { label: "Non-alcoholic", value: "Non-alcoholic", Icon: FiShield },
] as const;

export default function Category() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") ?? "";

  const baseParams = useMemo(() => new URLSearchParams(searchParams), [searchParams]);

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-violet-900 via-purple-900 to-fuchsia-950 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.18),transparent_35%)]" />

      <SectionWrapper className="relative py-0">
        <h2 className="text-center text-4xl font-bold text-white sm:text-5xl">
          Our Products
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-center text-sm text-white/85 sm:text-lg">
          Discover our premium selection of beers, wines, and spirits. All
          products are carefully curated for quality and taste.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {categories.map(({ label, value, Icon }) => {
            const active = selectedCategory === value;
            return (
            <button
              key={value}
              type="button"
              onClick={() => {
                const next = new URLSearchParams(baseParams);
                next.set("category", value);
                router.push(`/products?${next.toString()}`);
              }}
              aria-pressed={active}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium uppercase tracking-wide text-white transition-colors ${
                active
                  ? "border-white/40 bg-white/20"
                  : "border-white/20 bg-white/10 hover:bg-white/20"
              }`}
            >
              <Icon className="text-xs" />
              {label}
              <FiChevronDown className="text-[11px]" />
            </button>
          )})}
        </div>

        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => {
              const next = new URLSearchParams(baseParams);
              next.delete("category");
              const query = next.toString();
              router.push(query ? `/products?${query}` : "/products");
            }}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors ${
              selectedCategory
                ? "border-white/20 bg-white/10 hover:bg-white/20"
                : "border-white/40 bg-white/20"
            }`}
          >
            <FiGrid className="text-xs" />
            All Products
            <FiStar className="text-xs" />
          </button>
        </div>
      </SectionWrapper>
    </section>
  );
}
