import { ReactNode } from "react";

type SectionWrapperProps = {
  children: ReactNode;
  className?: string;
};

export default function SectionWrapper({
  children,
  className = "",
}: SectionWrapperProps) {
  return (
    <section className={`mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 ${className}`}>
      {children}
    </section>
  );
}
