import { FiShield } from "react-icons/fi";
import SectionWrapper from "@/components/layout/SectionWrapper";

export default function CTA() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-violet-900 via-purple-900 to-fuchsia-950 py-14 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_40%),radial-gradient(circle_at_80%_75%,rgba(236,72,153,0.18),transparent_35%)]" />
      <SectionWrapper className="relative py-0">
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-medium text-white/90">
            Premium Delivery Service
            <span className="text-amber-300">⚡</span>
          </span>
        </div>

        <h2 className="mx-auto mt-5 max-w-3xl text-center text-4xl font-extrabold leading-tight sm:text-6xl">
          Fast Alcohol Delivery in Saskatoon
          <span className="mt-1 block bg-gradient-to-r from-cyan-300 to-amber-300 bg-clip-text text-transparent">
            off-sale alcohol delivery
          </span>
        </h2>

        <p className="mx-auto mt-5 max-w-3xl text-center text-sm leading-8 text-white/90 sm:text-2xl">
          Lucky Prarie provides fast and reliable alcohol delivery in Saskatoon,
          Saskatchewan. Order beer, wine, liquor, ready-to-drink beverages,
          lighter, and snacks online and get them delivered anywhere in Saskatoon
          in <span className="font-semibold text-cyan-300">under 30 minutes</span>.
          {" "}Our local delivery service operates daily
          <span className="font-semibold text-cyan-300"> from 9:30 AM to 2:00 AM.</span>
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/15 bg-white/8 p-6 backdrop-blur-sm">
            <h3 className="flex items-center gap-3 text-lg font-bold sm:text-2xl">
              <span className="h-6 w-1.5 rounded-full bg-cyan-300" />
              Wide Selection &amp; Brands
            </h3>
            <p className="mt-3 text-sm leading-7 text-white/85 sm:text-lg">
              We carry a wide range of popular Canadian and international brands
              including Molson Canadian, Bud Light, Corona, Fireball Whisky, White
              Claw and more. Whether you are hosting a party, relaxing at home, or
              need last-minute drinks, Zionn makes ordering alcohol online quick
              and convenient.
            </p>
          </article>

          <article className="rounded-3xl border border-white/15 bg-white/8 p-6 backdrop-blur-sm">
            <h3 className="flex items-center gap-3 text-lg font-bold sm:text-2xl">
              <span className="h-6 w-1.5 rounded-full bg-fuchsia-300" />
              Secure &amp; Compliant
            </h3>
            <p className="mt-3 text-sm leading-7 text-white/85 sm:text-lg">
              All deliveries require government-issued ID to verify you are 19
              years of age or older, in strict compliance with Saskatchewan
              regulations. Our goal is to provide the fastest and most reliable
              alcohol delivery service in Saskatoon.
            </p>
          </article>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/35 bg-white/10 px-7 py-3 text-xl font-semibold text-white backdrop-blur-sm">
            <FiShield className="text-lg text-yellow-300" />
            Age verified at your door
          </div>
        </div>

        <p className="mt-8 text-center text-lg text-white/85">
          * Delivery time may vary based on location and availability
        </p>
      </SectionWrapper>
    </section>
  );
}
