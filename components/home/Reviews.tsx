"use client";

import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";
import SectionWrapper from "@/components/layout/SectionWrapper";

const customerReviews = [
  {
    name: "SnackPanther78",
    review:
      "Stayed for drinks. Great atmosphere, nice music, excellent service and a fantastic view. Cruise ship was in the way, which we knew about beforehand.",
    timeAgo: "4 month ago",
  },
  {
    name: "JIM LEE",
    review:
      "We recently held our company event and the location was absolutely stunning, with amazing harbour views that really added to the experience.",
    timeAgo: "3 months ago",
  },
  {
    name: "Sarah charles (Thewhere to)",
    review:
      "Cruise Bar and restaurant is a harbour front gem in the heart of the city. Perfect above the shimmering waters with excellent service.",
    timeAgo: "2 months ago",
  },
  {
    name: "Kylie R",
    review:
      "Super fast delivery and everything arrived chilled. The app was easy to use and support was very responsive.",
    timeAgo: "1 month ago",
  },
  {
    name: "Aman D",
    review:
      "Great selection of premium packs and fair prices. The driver was polite and delivery was right on time.",
    timeAgo: "3 weeks ago",
  },
  {
    name: "Noah P",
    review:
      "Ordered for a small gathering and the whole process was smooth. Will definitely order again this weekend.",
    timeAgo: "1 week ago",
  },
] as const;

export default function Reviews() {
  const [visibleCount, setVisibleCount] = useState(3);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCount(3);
      } else if (window.innerWidth >= 768) {
        setVisibleCount(2);
      } else {
        setVisibleCount(1);
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const maxStartIndex = Math.max(0, customerReviews.length - visibleCount);
  const clampedStartIndex = Math.min(startIndex, maxStartIndex);

  const handlePrev = () =>
    setStartIndex((prev) => Math.max(0, Math.min(prev, maxStartIndex) - 1));
  const handleNext = () =>
    setStartIndex((prev) => Math.min(maxStartIndex, Math.min(prev, maxStartIndex) + 1));

  return (
    <section className="w-full bg-[#F9FAFB] py-14">
      <SectionWrapper className="py-0">
      <h2 className="text-center text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        What Our Customers Say
      </h2>
      <p className="mx-auto mt-2 max-w-3xl text-center text-sm text-slate-500 sm:text-base">
        We take pride in our service. Zion Alcohol Delivery has earned a 4/5
        rating from 2,075+ satisfied customers across Saskatoon.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={handlePrev}
          disabled={clampedStartIndex === 0}
          aria-label="Previous reviews"
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 md:inline-flex"
        >
          <FiChevronLeft />
        </button>

        <div className="flex-1 overflow-hidden">
          <div
            className="-mx-2 flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${clampedStartIndex * (100 / visibleCount)}%)`,
            }}
          >
            {customerReviews.map((item) => (
              <div
                key={item.name}
                className="shrink-0 px-2"
                style={{ width: `${100 / visibleCount}%` }}
              >
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-300 text-xs font-semibold text-slate-700">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">
                          Verified Google Review
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold border border-slate-300 rounded-full px-2 py-1 text-slate-500">G</span>
                  </div>

                  <div className="mt-3 flex items-center gap-1 text-amber-400">
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <FiStar className="fill-current" />
                    <span className="ml-2 text-xs text-slate-500">{item.timeAgo}</span>
                  </div>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-700">
                    {item.review}
                  </p>
                  <button
                    type="button"
                    className="mt-1 text-sm font-medium text-sky-600 hover:text-sky-700"
                  >
                    Read More
                  </button>
                </article>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={clampedStartIndex === maxStartIndex}
          aria-label="Next reviews"
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 md:inline-flex"
        >
          <FiChevronRight />
        </button>
      </div>

        <div className="mt-5 flex justify-center gap-2">
          {Array.from({ length: maxStartIndex + 1 }).map((_, index) => (
            <span
              key={index}
              className={
                index === clampedStartIndex
                  ? "h-1.5 w-6 rounded-full bg-blue-500"
                  : "h-1.5 w-1.5 rounded-full bg-slate-300"
              }
            />
          ))}
        </div>

        <div className="mx-auto mt-7 flex w-full max-w-md flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            className="rounded-xl cursor-pointer border border-slate-300 bg-white px-4 py-3 text-md font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Read All Reviews
          </button>
          <button
            type="button"
            className="rounded-xl bg-blue-600 px-4 py-3 text-md cursor-pointer font-medium text-white transition-colors hover:bg-blue-700"
          >
            Write a review on Google
          </button>
        </div>
      </SectionWrapper>
    </section>
  );
}
