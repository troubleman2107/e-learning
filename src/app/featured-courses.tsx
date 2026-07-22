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

/* ───────────────── CATEGORY THEMES & METADATA ───────────────────── */

interface CategoryTheme {
  subtitle: string;
  highlightedName: string;
  normalPrefix?: string;
  cardBg: string;
  cardBorder: string;
  highlightText: string;
  accentBar: string;
  buttonBorder: string;
  buttonBg: string;
  buttonText: string;
  buttonHoverBg: string;
  buttonHoverBorder: string;
  buttonHoverShadow: string;
}

const categoryThemes: Record<string, CategoryTheme> = {
  "thu-nhap-thu-dong": {
    subtitle: "Các bí kíp MMO, Affiliate, Dropship... đã được kiểm chứng",
    highlightedName: "THU NHẬP THỤ ĐỘNG",
    normalPrefix: "Kinh Doanh",
    cardBg: "from-amber-50/80 via-orange-50/40 to-white",
    cardBorder: "border-amber-200/90",
    highlightText: "text-amber-600",
    accentBar: "bg-amber-500",
    buttonBorder: "border-amber-500",
    buttonBg: "bg-white",
    buttonText: "text-amber-600",
    buttonHoverBg: "hover:bg-amber-500",
    buttonHoverBorder: "hover:border-amber-500",
    buttonHoverShadow: "hover:shadow-amber-500/25",
  },
  "kinh-doanh-marketing": {
    subtitle: "Xây dựng chiến lược bán hàng và thương hiệu bùng nổ",
    highlightedName: "MARKETING THỰC CHIẾN",
    normalPrefix: "Kinh Doanh &",
    cardBg: "from-rose-50/80 via-pink-50/40 to-white",
    cardBorder: "border-rose-200/90",
    highlightText: "text-rose-600",
    accentBar: "bg-rose-500",
    buttonBorder: "border-rose-500",
    buttonBg: "bg-white",
    buttonText: "text-rose-600",
    buttonHoverBg: "hover:bg-rose-500",
    buttonHoverBorder: "hover:border-rose-500",
    buttonHoverShadow: "hover:shadow-rose-500/25",
  },
  "kinh-doanh-online": {
    subtitle: "Xây dựng chiến lược bán hàng và thương hiệu bùng nổ trên nền tảng số",
    highlightedName: "KINH DOANH ONLINE",
    cardBg: "from-blue-50/80 via-indigo-50/40 to-white",
    cardBorder: "border-blue-200/90",
    highlightText: "text-blue-600",
    accentBar: "bg-blue-500",
    buttonBorder: "border-blue-600",
    buttonBg: "bg-white",
    buttonText: "text-blue-600",
    buttonHoverBg: "hover:bg-blue-600",
    buttonHoverBorder: "hover:border-blue-600",
    buttonHoverShadow: "hover:shadow-blue-600/25",
  },
  "ung-dung-ai": {
    subtitle: "Làm chủ công nghệ AI, tự động hóa công việc và tăng năng suất gấp 10 lần",
    highlightedName: "ỨNG DỤNG AI",
    cardBg: "from-purple-50/80 via-violet-50/40 to-white",
    cardBorder: "border-purple-200/90",
    highlightText: "text-purple-600",
    accentBar: "bg-purple-500",
    buttonBorder: "border-purple-600",
    buttonBg: "bg-white",
    buttonText: "text-purple-600",
    buttonHoverBg: "hover:bg-purple-600",
    buttonHoverBorder: "hover:border-purple-600",
    buttonHoverShadow: "hover:shadow-purple-600/25",
  },
  "the-hinh": {
    subtitle: "Xây dựng thể hình vượt trội với phương pháp khoa học và lộ trình bài bản",
    highlightedName: "THỂ HÌNH",
    cardBg: "from-emerald-50/80 via-teal-50/40 to-white",
    cardBorder: "border-emerald-200/90",
    highlightText: "text-emerald-600",
    accentBar: "bg-emerald-500",
    buttonBorder: "border-emerald-600",
    buttonBg: "bg-white",
    buttonText: "text-emerald-600",
    buttonHoverBg: "hover:bg-emerald-600",
    buttonHoverBorder: "hover:border-emerald-600",
    buttonHoverShadow: "hover:shadow-emerald-600/25",
  },
  "ngoai-ngu": {
    subtitle: "Chinh phục ngoại ngữ nhanh chóng với phương pháp thực chiến hiệu quả",
    highlightedName: "NGOẠI NGỮ",
    cardBg: "from-sky-50/80 via-blue-50/40 to-white",
    cardBorder: "border-sky-200/90",
    highlightText: "text-sky-600",
    accentBar: "bg-sky-500",
    buttonBorder: "border-sky-600",
    buttonBg: "bg-white",
    buttonText: "text-sky-600",
    buttonHoverBg: "hover:bg-sky-600",
    buttonHoverBorder: "hover:border-sky-600",
    buttonHoverShadow: "hover:shadow-sky-600/25",
  },
  "lap-trinh": {
    subtitle: "Nắm vững kỹ năng lập trình từ cơ bản đến nâng cao với dự án thực tế",
    highlightedName: "LẬP TRÌNH & DEV",
    cardBg: "from-indigo-50/80 via-violet-50/40 to-white",
    cardBorder: "border-indigo-200/90",
    highlightText: "text-indigo-600",
    accentBar: "bg-indigo-500",
    buttonBorder: "border-indigo-600",
    buttonBg: "bg-white",
    buttonText: "text-indigo-600",
    buttonHoverBg: "hover:bg-indigo-600",
    buttonHoverBorder: "hover:border-indigo-600",
    buttonHoverShadow: "hover:shadow-indigo-600/25",
  },
};

const defaultTheme: CategoryTheme = {
  subtitle: "Các khóa học được thiết kế bởi chuyên gia hàng đầu Việt Nam",
  highlightedName: "",
  cardBg: "from-indigo-50/70 via-slate-50/40 to-white",
  cardBorder: "border-indigo-100/90",
  highlightText: "text-indigo-600",
  accentBar: "bg-indigo-500",
  buttonBorder: "border-indigo-600",
  buttonBg: "bg-white",
  buttonText: "text-indigo-600",
  buttonHoverBg: "hover:bg-indigo-600",
  buttonHoverBorder: "hover:border-indigo-600",
  buttonHoverShadow: "hover:shadow-indigo-600/20",
};

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
    const page = Math.round((scrollLeft / maxScroll) * (totalPages - 1));
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

  // Retrieve category theme or fallback to default
  const theme = categoryThemes[group.slug] || defaultTheme;
  const highlightedName = theme.highlightedName || group.name.toUpperCase();

  // Extract normal title prefix if any
  let normalPart = theme.normalPrefix || "";
  if (!normalPart && highlightedName !== group.name.toUpperCase()) {
    const nameWordsLower = group.name.toLowerCase().split(" ");
    const firstHighlightWord = highlightedName.split(" ")[0]?.toLowerCase() || "";
    const highlightStartIdx = nameWordsLower.indexOf(firstHighlightWord);
    if (highlightStartIdx > 0) {
      normalPart = group.name.split(" ").slice(0, highlightStartIdx).join(" ");
    }
  }

  return (
    <div className="relative">
      {/* khoahocre.com style Section Header Card */}
      <div
        className={`mb-6 rounded-2xl border ${theme.cardBorder} bg-gradient-to-r ${theme.cardBg} p-4 sm:p-5 md:p-6 shadow-xs shadow-indigo-100/40`}
      >
        {/* Top Row: Category Title (Left) + Actions/Xem thêm Button (Right) */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base sm:text-xl md:text-[22px] font-black tracking-tight text-slate-900 leading-snug sm:leading-tight">
            {normalPart && <span>{normalPart} </span>}
            <span className={`font-extrabold ${theme.highlightText}`}>
              {highlightedName}
            </span>
          </h2>

          {/* Right Action: Carousel Controls + Xem thêm Pill Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Desktop Carousel Arrows */}
            <div className="hidden items-center gap-1.5 sm:flex">
              <button
                onClick={() => scrollTo("left")}
                className="flex size-9 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-500 shadow-xs transition-all hover:border-indigo-300 hover:bg-white hover:text-indigo-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Trượt sang trái"
                disabled={currentPage === 0}
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() => scrollTo("right")}
                className="flex size-9 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-500 shadow-xs transition-all hover:border-indigo-300 hover:bg-white hover:text-indigo-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Trượt sang phải"
                disabled={currentPage >= totalPages - 1}
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            {/* khoahocre.com Style "Xem thêm" Pill Button */}
            <Link
              href={`/courses?category=${group.slug}`}
              className={`inline-flex items-center gap-1 rounded-full border-2 ${theme.buttonBorder} ${theme.buttonBg} ${theme.buttonText} px-3.5 py-1.5 text-xs sm:text-sm font-bold tracking-wide shadow-2xs transition-all hover:bg-[#356DF1] hover:text-white hover:border-[#356DF1] active:scale-95 shrink-0`}
              title="Xem tất cả khóa học"
            >
              <span>Xem thêm</span>
              <ChevronRight className="size-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>

        {/* Bottom Row: Subtitle Description */}
        <p className="mt-2 text-xs text-slate-500 sm:text-sm font-medium leading-relaxed">
          {theme.subtitle}
        </p>
        <div
          className={`mt-2.5 h-0.5 w-12 rounded-full ${theme.accentBar} opacity-70`}
        />
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

export function FeaturedCourses({
  courses,
  categories,
}: FeaturedCoursesProps) {
  if (courses.length === 0) return null;

  // Group courses by category
  const groups: CategoryGroup[] = categories
    .map((cat) => {
      const catCourses = courses.filter((c) => c.categorySlug === cat.slug);
      const theme = categoryThemes[cat.slug] || defaultTheme;
      return {
        slug: cat.slug,
        name: cat.name,
        subtitle: theme.subtitle,
        highlightedName: theme.highlightedName,
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

