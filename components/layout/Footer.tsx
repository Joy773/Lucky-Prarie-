import Link from "next/link";
import { FiShield } from "react-icons/fi";
import SectionWrapper from "@/components/layout/SectionWrapper";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#f6f4fb]">
      <SectionWrapper className="py-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-10">
          <div className="col-span-2 md:col-span-1">
            <p className="inline-flex items-center gap-2 text-2xl font-bold text-fuchsia-700">
              <FiShield className="text-xl" />
              Lucky Prarie Delivery
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
              Get fast, reliable alcohol delivery in Saskatoon with Lucky Prarie.
              Order beer, wines, spirits online and enjoy delivery to your
              doorstep in 30-45+ minutes. Age verified and secure service.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
              Customer Service
            </h3>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-700">
              <Link href="/help" className="hover:text-slate-900">
                Help Center
              </Link>
              <Link href="/faq" className="hover:text-slate-900">
                FAQ
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
              Legal & Info
            </h3>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-700">
              <Link href="/about" className="hover:text-slate-900">
                About Us
              </Link>
              <Link href="/privacy" className="hover:text-slate-900">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-slate-900">
                Terms of Service
              </Link>
              <Link href="/age-verification" className="hover:text-slate-900">
                Age Verification
              </Link>
              <Link href="/responsible-drinking" className="hover:text-slate-900">
                Responsible Drinking
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-300 pt-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Lucky Prarie Delivery. All rights reserved. | SJ2023
          </p>
        </div>
      </SectionWrapper>
    </footer>
  );
}
