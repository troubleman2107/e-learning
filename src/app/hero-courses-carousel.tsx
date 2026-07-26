"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CourseCard } from "@/components/course-card";
import { FeaturedCourse } from "./featured-courses";

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
      timerRef.current = setInterval(nextSlide, 3500);
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

  return (
    <div
      className="relative w-full max-w-[380px] mx-auto select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Glow background behind the carousel */}
      <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-25 blur-2xl transition duration-1000 group-hover:opacity-40" />

      {/* Wrapper with 3D-like perspectives / depth */}
      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-slate-950/60 p-3 shadow-2xl backdrop-blur-xl">
        {/* Slides container */}
        <div className="relative h-[510px] w-full">
          {courses.map((course, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={course.id}
                className={`absolute inset-0 flex flex-col transition-all duration-700 ease-in-out ${
                  isActive
                    ? "opacity-100 scale-100 pointer-events-auto z-10"
                    : "opacity-0 scale-95 pointer-events-none z-0"
                }`}
              >
                <div className="h-full overflow-hidden rounded-xl border border-indigo-500/30 bg-slate-900/90 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 transition-all hover:border-indigo-400/50 [&_a]:border-none [&_a]:bg-transparent [&_h3]:text-white [&_h3]:group-hover:text-indigo-300 [&_p]:text-slate-300/90 [&_.border-gray-200\/70]:border-transparent [&_.border-gray-100\/80]:border-slate-800/60 [&_.border-b]:border-slate-800/80 [&_.text-gray-900]:text-white [&_.text-gray-500]:text-slate-300/90 [&_.bg-white]:bg-transparent">
                  <CourseCard
                    course={{
                      id: course.id,
                      title: course.title,
                      description: course.description,
                      shortDescription: course.shortDescription,
                      price: course.price,
                      thumbnail: course.thumbnail,
                      thumbnailUrl: course.thumbnailUrl,
                      categoryName: course.categoryName,
                      studentCount: course.studentCount,
                      author: course.author,
                      isPaid: course.isPaid,
                    }}
                    index={idx}
                  />
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
