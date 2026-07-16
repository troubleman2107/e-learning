"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { BookOpenCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { CourseCard as SharedCourseCard } from "@/components/course-card";

/* ───────────────────────── TYPES ───────────────────────── */

export interface FeaturedCourse {
  id: string;
  title: string;
  description: string;
  shortDescription?: string | null;
  price: number;
  categoryName: string;
  categorySlug: string;
  moduleCount: number;
  studentCount: number;
  visualIndex: number;
  isPaid?: boolean;
  thumbnail?: string | null;
  author?: {
    id: string;
    name: string;
  } | null;
}

interface CategoryGroup {
  slug: string;
  name: string;
  subtitle: string;
  highlightedName: string;
  courses: FeaturedCourse[];
}

interface FeaturedCoursesProps {
  courses: FeaturedCourse[];
  categories: { slug: string; name: string }[];
}

/* ───────────────── CATEGORY METADATA ───────────────────── */

const categoryMeta: Record<
  string,
  { subtitle: string; highlightedName: string }
> = {
  "thu-nhap-thu-dong": {
    subtitle:
      "Các bí kíp MMO, Affiliate, Dropship... đã được kiểm chứng",
    highlightedName: "THU NHẬP THỤ ĐỘNG",
  },
  "kinh-doanh-marketing": {
    subtitle:
      "Xây dựng chiến lược bán hàng và thương hiệu bùng nổ",
    highlightedName: "MARKETING THỰC CHIẾN",
  },
  "kinh-doanh-online": {
    subtitle:
      "Xây dựng chiến lược bán hàng và thương hiệu bùng nổ trên nền tảng số",
    highlightedName: "KINH DOANH ONLINE",
  },
  "ung-dung-ai": {
    subtitle:
      "Làm chủ công nghệ AI, tự động hóa công việc và tăng năng suất gấp 10 lần",
    highlightedName: "ỨNG DỤNG AI",
  },
  "the-hinh": {
    subtitle:
      "Xây dựng thể hình vượt trội với phương pháp khoa học và lộ trình bài bản",
    highlightedName: "THỂ HÌNH",
  },
  "ngoai-ngu": {
    subtitle:
      "Chinh phục ngoại ngữ nhanh chóng với phương pháp thực chiến hiệu quả",
    highlightedName: "NGOẠI NGỮ",
  },
  "lap-trinh": {
    subtitle:
      "Nắm vững kỹ năng lập trình từ cơ bản đến nâng cao với dự án thực tế",
    highlightedName: "LẬP TRÌNH",
  },
};

const defaultMeta = {
  subtitle: "Các khóa học được thiết kế bởi chuyên gia hàng đầu Việt Nam",
  highlightedName: "",
};

/* ──────────────── VISUAL GRADIENTS ──────────────────────── */

const cardGradients = [
  "from-rose-500/85 to-pink-600/85",
  "from-sky-500/85 to-blue-600/85",
  "from-amber-500/85 to-orange-600/85",
  "from-indigo-500/85 to-violet-600/85",
  "from-teal-500/85 to-cyan-600/85",
  "from-emerald-500/85 to-green-600/85",
];

const cardPatterns = [
  "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.18) 0%, transparent 50%)",
  "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.18) 0%, transparent 50%)",
  "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.14) 0%, transparent 60%)",
  "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18) 0%, transparent 50%)",
  "radial-gradient(circle at 70% 70%, rgba(255,255,255,0.18) 0%, transparent 50%)",
  "radial-gradient(circle at 40% 60%, rgba(255,255,255,0.14) 0%, transparent 60%)",
];

/* ──────────────── FORMAT HELPERS ──────────────────────── */

function formatVnd(amount: number) {
  return `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
}

/* ──────────────── COURSE CARD ──────────────────────── */

function CourseCard({
  course,
  index,
}: {
  course: FeaturedCourse;
  index: number;
}) {
  return (
    <div className="w-[75vw] flex-shrink-0 snap-start sm:w-[45vw] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]">
      <SharedCourseCard course={course} index={index} />
    </div>
  );
}

/* ──────────────── CATEGORY CAROUSEL ──────────────────── */

function CategoryCarousel({ group }: { group: CategoryGroup }) {
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
  }, [calculatePages, group.courses.length]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setCurrentPage(0);
      return;
    }
    const page = Math.round(
      (scrollLeft / maxScroll) * (totalPages - 1)
    );
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  }, [totalPages]);

  const scrollTo = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.8;
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

  // Build the header text — split name into normal part + highlighted part
  const meta = categoryMeta[group.slug] || defaultMeta;
  const highlightedName = meta.highlightedName || group.name.toUpperCase();

  // Try to determine the "normal" prefix by removing the highlighted portion
  // e.g., name="Kinh Doanh & Marketing thực chiến", highlighted="MARKETING THỰC CHIẾN"
  //   → normalPart = "Kinh Doanh &"
  const highlightedWords = highlightedName.split(" ");
  const nameWordsLower = group.name.toLowerCase().split(" ");
  const firstHighlightWord = highlightedWords[0]?.toLowerCase() || "";
  const highlightStartIdx = nameWordsLower.indexOf(firstHighlightWord);
  const nameWords = group.name.split(" ");
  const normalPart =
    highlightStartIdx > 0
      ? nameWords.slice(0, highlightStartIdx).join(" ")
      : "";

  return (
    <div className="relative">
      {/* Section Header */}
      <div className="mb-5 flex items-start justify-between gap-4 sm:mb-6">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl md:text-3xl">
            {normalPart && <span>{normalPart} </span>}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              {highlightedName}
            </span>
          </h2>
          <p className="mt-1 text-sm text-gray-500 sm:mt-1.5 sm:text-base">
            {meta.subtitle}
          </p>
        </div>

        {/* Desktop nav arrows */}
        <div className="hidden flex-shrink-0 items-center gap-2 sm:flex">
          <button
            onClick={() => scrollTo("left")}
            className="flex size-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition-all hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Trượt sang trái"
            disabled={currentPage === 0}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={() => scrollTo("right")}
            className="flex size-10 items-center justify-center rounded-full border border-indigo-100 bg-indigo-600 text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Trượt sang phải"
            disabled={currentPage >= totalPages - 1}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="scrollbar-hide -mx-1 flex gap-4 overflow-x-auto scroll-smooth px-1 pb-2"
        style={{
          scrollSnapType: "x mandatory",
        }}
      >
        {group.courses.map((course, idx) => (
          <CourseCard key={course.id} course={course} index={idx} />
        ))}
      </div>

      {/* Pagination dots */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToPage(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentPage
                  ? "w-6 bg-indigo-600"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Trang ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────── MAIN COMPONENT ──────────────────────── */

export function FeaturedCourses({ courses, categories }: FeaturedCoursesProps) {
  if (courses.length === 0) return null;

  // Group courses by category
  const groups: CategoryGroup[] = categories
    .map((cat) => {
      const catCourses = courses.filter((c) => c.categorySlug === cat.slug);
      const meta = categoryMeta[cat.slug] || defaultMeta;
      return {
        slug: cat.slug,
        name: cat.name,
        subtitle: meta.subtitle,
        highlightedName: meta.highlightedName,
        courses: catCourses,
      };
    })
    .filter((g) => g.courses.length > 0);

  // Add uncategorized courses if any
  const uncategorized = courses.filter(
    (c) => !categories.some((cat) => cat.slug === c.categorySlug)
  );
  if (uncategorized.length > 0) {
    groups.push({
      slug: "other",
      name: "Khóa Học",
      subtitle: "Các khóa học nổi bật dành cho bạn",
      highlightedName: "KHÁC",
      courses: uncategorized,
    });
  }

  return (
    <div className="space-y-14">
      {groups.map((group) => (
        <CategoryCarousel key={group.slug} group={group} />
      ))}
    </div>
  );
}
