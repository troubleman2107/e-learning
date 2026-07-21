"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FeaturedCourse } from "./featured-courses";
import { stripHtml } from "@/lib/utils";

export function HeroCoursesCarousel({
  courses,
}: {
  courses: FeaturedCourse[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  const minSwipeDistance = 50;

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % courses.length);
  }, [courses.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + courses.length) % courses.length);
  }, [courses.length]);

  useEffect(() => {
    if (!isHovered && courses.length > 1) {
      timerRef.current = setInterval(nextSlide, 3000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, courses.length, nextSlide]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const onTouchEnd = () => {
    if (
      touchStartX.current === null ||
      touchStartY.current === null ||
      touchEndX.current === null ||
      touchEndY.current === null
    )
      return;

    const diffX = touchStartX.current - touchEndX.current;
    const diffY = touchStartY.current - touchEndY.current;

    // Check if the horizontal swipe was more significant than any vertical swipe
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  if (!courses || courses.length === 0) {
    return null;
  }

  const formatVnd = (amount: number) => {
    return `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
  };

  return (
    <div
      className="relative w-full max-w-lg mx-auto lg:max-w-none select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Glow background behind the carousel */}
      <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 blur-xl transition duration-1000 group-hover:opacity-30 group-hover:duration-200" />

      {/* Wrapper with 3D-like perspectives / depth */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 p-4 shadow-2xl backdrop-blur-md">
        {/* Slides container */}
        <div className="relative h-[370px] w-full">
          {courses.map((course, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={course.id}
                className={`absolute inset-0 flex flex-col transition-all duration-700 ease-in-out ${
                  isActive
                    ? "opacity-100 scale-100 pointer-events-auto"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                {/* Thumbnail Image */}
                <div className="relative h-44 w-full overflow-hidden rounded-xl bg-slate-950">
                  <img
                    src={course.thumbnail || "/course-docker.png"}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform duration-[8000ms] ease-out"
                    style={{
                      transform: isActive ? "scale(1.05)" : "scale(1.0)",
                    }}
                  />
                  <span className="absolute left-2.5 top-2.5 rounded-md bg-indigo-650 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                    {course.categoryName}
                  </span>
                </div>

                {/* Details Section */}
                <div className="flex flex-col flex-1 pt-4 pb-1">
                  <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1 transition-colors hover:text-indigo-400">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-gray-300 line-clamp-2 leading-relaxed">
                    {course.shortDescription || stripHtml(course.description)}
                  </p>

                  <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/5">
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">
                        Giá khóa học
                      </p>
                      <span className="text-sm sm:text-base font-extrabold text-indigo-400">
                        {course.price === 0
                          ? "Miễn phí"
                          : formatVnd(course.price)}
                      </span>
                    </div>
                    <Link
                      href={`/course/${course.id}`}
                      className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition-all hover:bg-indigo-600 hover:text-white hover:shadow-indigo-500/20 hover:-translate-y-0.5"
                    >
                      Chi tiết khóa học
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel controls & pagination */}
        {courses.length > 1 && (
          <div className="mt-3 flex items-center justify-center md:justify-between px-1">
            {/* Dots */}
            <div className="flex gap-1.5">
              {courses.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? "w-5 bg-indigo-500"
                      : "w-1.5 bg-gray-600 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next buttons */}
            <div className="hidden md:flex gap-1.5">
              <button
                onClick={prevSlide}
                className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={nextSlide}
                className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile-only control buttons below the card container */}
      {courses.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4 md:hidden">
          <button
            onClick={prevSlide}
            className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-slate-900/60 text-white shadow-md backdrop-blur-md transition-all active:scale-95 hover:bg-slate-800/65"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={nextSlide}
            className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-slate-900/60 text-white shadow-md backdrop-blur-md transition-all active:scale-95 hover:bg-slate-800/65"
            aria-label="Next slide"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}
