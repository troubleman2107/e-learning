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

  // Group courses into pairs of 2 for 2-card hero layout
  const coursePairs: FeaturedCourse[][] = [];
  if (courses && courses.length > 0) {
    for (let i = 0; i < courses.length; i += 2) {
      const pair = courses.slice(i, i + 2);
      if (pair.length === 1 && courses.length > 1) {
        pair.push(courses[0]);
      }
      coursePairs.push(pair);
    }
  }

  const nextSlide = useCallback(() => {
    if (coursePairs.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % coursePairs.length);
  }, [coursePairs.length]);

  const prevSlide = useCallback(() => {
    if (coursePairs.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + coursePairs.length) % coursePairs.length);
  }, [coursePairs.length]);

  useEffect(() => {
    if (!isHovered && coursePairs.length > 1) {
      timerRef.current = setInterval(nextSlide, 4000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, coursePairs.length, nextSlide]);

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
      className="relative w-full max-w-sm sm:max-w-xl md:max-w-2xl xl:max-w-none mx-auto select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Glow background behind the carousel */}
      <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-25 blur-2xl transition duration-1000 group-hover:opacity-40" />

      {/* Wrapper with 3D-like perspectives / depth */}
      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-slate-950/60 p-3.5 shadow-2xl backdrop-blur-xl">
        {/* Slides container */}
        <div className="relative min-h-[440px] sm:min-h-[445px] w-full">
          {coursePairs.map((pair, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={idx}
                className={`absolute inset-0 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 transition-all duration-700 ease-in-out ${
                  isActive
                    ? "opacity-100 scale-100 pointer-events-auto z-10"
                    : "opacity-0 scale-95 pointer-events-none z-0"
                }`}
              >
                {pair.map((course, courseIdx) => (
                  <div
                    key={`${course.id}-${courseIdx}`}
                    className={`h-full ${courseIdx === 1 ? "hidden sm:block" : ""}`}
                  >
                    <CourseCard
                      variant="dark"
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
                      index={idx * 2 + courseIdx}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Carousel controls & pagination */}
        {coursePairs.length > 1 && (
          <div className="relative z-20 mt-3.5 flex items-center justify-between px-2">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {coursePairs.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeIndex
                      ? "w-7 bg-indigo-500 shadow-sm shadow-indigo-500/50"
                      : "w-2 bg-slate-600/80 hover:bg-slate-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="flex size-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-indigo-600 hover:border-indigo-500 active:scale-95 cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={nextSlide}
                className="flex size-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-indigo-600 hover:border-indigo-500 active:scale-95 cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
