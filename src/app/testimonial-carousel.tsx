"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  label: string;
  content: string;
  rating: number;
}

interface TestimonialCarouselProps {
  testimonials: TestimonialItem[];
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const calculatePages = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollWidth = el.scrollWidth;
    const clientWidth = el.clientWidth;
    if (scrollWidth <= clientWidth) {
      setTotalPages(1);
      setCurrentPage(0);
      return;
    }
    const pages = Math.ceil(scrollWidth / clientWidth);
    setTotalPages(pages);
  }, []);

  useEffect(() => {
    calculatePages();
    window.addEventListener("resize", calculatePages);
    return () => window.removeEventListener("resize", calculatePages);
  }, [calculatePages, testimonials.length]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setCurrentPage(0);
      return;
    }
    const page = Math.round((scrollLeft / maxScroll) * (totalPages - 1));
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  }, [totalPages]);

  const scrollTo = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.85;
    el.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  }, []);

  const scrollToPage = useCallback(
    (page: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (totalPages <= 1) return;
      el.scrollTo({
        left: (page / (totalPages - 1)) * maxScroll,
        behavior: "smooth",
      });
    },
    [totalPages]
  );

  return (
    <div className="relative">
      {/* Scrollable Track */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="scrollbar-hide -mx-2 flex gap-5 overflow-x-auto scroll-smooth px-2 py-4"
        style={{
          scrollSnapType: "x mandatory",
        }}
      >
        {testimonials.map((t) => (
          <article
            key={t.id}
            className="w-[85vw] flex-shrink-0 snap-start sm:w-[50vw] md:w-[calc(33.333%-14px)] group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10"
          >
            {/* Decorative Big Quotes Watermark */}
            <span className="pointer-events-none absolute right-5 top-3 select-none font-serif text-6xl font-bold leading-none text-indigo-500/10">
              &ldquo;&ldquo;
            </span>

            <div>
              {/* Category Pill Tag */}
              <span className="inline-block rounded-md bg-indigo-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-3.5">
                {t.label}
              </span>

              {/* Quote Body */}
              <p className="relative z-10 text-xs sm:text-sm leading-relaxed text-slate-700 font-normal mb-6">
                {t.content}
              </p>
            </div>

            {/* Footer User Info */}
            <div className="relative z-10 flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-md border-2 border-white">
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <h4 className="truncate text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {t.name}
                  </h4>
                  <p className="truncate text-[11px] text-slate-500">
                    {t.role}
                  </p>
                </div>
              </div>

              {/* 5-Star Rating */}
              <div className="flex shrink-0 gap-0.5 text-amber-400">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* khoahocre.com style Bottom Controls: Nav Arrows & Dots */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={() => scrollTo("left")}
          className="flex size-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600 shadow-sm transition-all hover:bg-slate-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Xem đánh giá trước"
          disabled={currentPage === 0}
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2 px-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToPage(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === currentPage
                    ? "w-7 bg-indigo-600"
                    : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Trang đánh giá ${i + 1}`}
              />
            ))}
          </div>
        )}

        <button
          onClick={() => scrollTo("right")}
          className="flex size-11 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md shadow-indigo-500/25 transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/35 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Xem đánh giá tiếp theo"
          disabled={currentPage >= totalPages - 1}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
