"use client";

import { FiShield, FiZap } from "react-icons/fi";
import SearchBar from "@/components/layout/SearchBar";
import SectionWrapper from "@/components/layout/SectionWrapper";
import { useHomeSearch } from "@/components/home/HomeSearchContext";

export default function Hero() {
  const { query, setQuery } = useHomeSearch();

  return (
    <section>
      <div className="border-b border-fuchsia-200/60 bg-fuchsia-50/70">
        <SectionWrapper className="flex items-center justify-center gap-2 !py-1.5 text-xs text-fuchsia-900">
          <FiShield className="text-[11px]" />
          <p>Must be 19+ to order, ID required at delivery.</p>
        </SectionWrapper>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-b from-violet-900 via-purple-900 to-fuchsia-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_40%),radial-gradient(circle_at_80%_75%,rgba(236,72,153,0.18),transparent_35%)]" />

        <SectionWrapper className="relative flex justify-center py-10 lg:py-12">
          <div className="w-full max-w-xl">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm font-semibold text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                Reliable local service
              </span>
            </div>

            <h1 className="mt-4 max-w-2xl text-balance text-center text-3xl font-bold leading-[1.15] text-white sm:text-4xl md:text-5xl lg:text-[48px]">
              <span className="block">
                <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent">
                  Alcohol Delivery in Saskatoon
                </span>{" "}
                <span className="bg-gradient-to-r from-cyan-200 via-sky-300 to-blue-300 bg-clip-text text-transparent">
                  Premium Liquor Delivered in Under 30 Minutes
                </span>
              </span>
              <span className="mt-2 block text-[#f2d1f5] text-xl font-semibold sm:text-2xl md:text-3xl lg:text-[34px]">
                Open 9:30AM-2:00AM.
              </span>
            </h1>

            <div className="mt-5 flex justify-center">
              <SearchBar
                id="hero-search"
                value={query}
                onChange={setQuery}
                placeholder="Search for products..."
                className="max-w-full shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
              />
            </div>

            <div className="mt-4 flex justify-center">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white"
              >
                <FiZap className="text-amber-300" />
                Pay At The Door
              </button>
            </div>
          </div>
        </SectionWrapper>
      </div>
    </section>
  );
}
