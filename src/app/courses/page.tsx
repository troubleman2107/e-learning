import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpenCheck, Clock3, Star, UsersRound, GraduationCap, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import { SearchInput } from "./search-input";
import { PriceFilter } from "./price-filter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Tất cả khóa học | E-learning",
};

const visuals = [
  "border-teal-100 bg-teal-50 text-teal-700",
  "border-sky-100 bg-sky-50 text-sky-700",
  "border-amber-100 bg-amber-50 text-amber-700",
  "border-rose-100 bg-rose-50 text-rose-700"
];

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; page?: string; maxPrice?: string; authorId?: string }>;
}) {
  const { 
    category: activeCategory, 
    search: searchQuery, 
    page: pageParam, 
    maxPrice: maxPriceParam,
    authorId: activeAuthorId,
  } = await searchParams;

  const limit = 12; // Divisible by 2, 3, and 4 for perfect grid rows
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const skip = (currentPage - 1) * limit;
  const currentMaxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;

  const whereClause = {
    isPublished: true,
    AND: [
      activeCategory
        ? {
            category: {
              slug: activeCategory,
            },
          }
        : {},
      searchQuery
        ? {
            OR: [
              { title: { contains: searchQuery, mode: "insensitive" } as any },
              { description: { contains: searchQuery, mode: "insensitive" } as any },
            ],
          }
        : {},
      currentMaxPrice !== undefined
        ? {
            price: {
              lte: currentMaxPrice,
            },
          }
        : {},
      activeAuthorId
        ? {
            authorId: activeAuthorId,
          }
        : {},
    ],
  };

  const [dbCourses, totalCoursesCount, allCoursesCount, categories, maxPriceRecord, authors] = await Promise.all([
    prisma.course.findMany({
      where: whereClause,
      include: {
        category: true,
        author: true,
        _count: {
          select: {
            orders: true,
            modules: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.course.count({
      where: whereClause,
    }),
    prisma.course.count({
      where: { isPublished: true },
    }),
    prisma.category.findMany({
      include: {
        _count: {
          select: {
            courses: {
              where: { isPublished: true },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.course.findFirst({
      where: { isPublished: true },
      orderBy: {
        price: "desc",
      },
      select: {
        price: true,
      },
    }),
    prisma.author.findMany({
      include: {
        _count: {
          select: {
            courses: {
              where: { isPublished: true },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const maxPriceLimit = maxPriceRecord?.price || 500000;
  const totalPages = Math.ceil(totalCoursesCount / limit);

  // Unified helper to construct URLs preserving active search, category, and price selections
  const createFilterLink = ({
    category,
    search,
    maxPrice,
    page,
    authorId,
  }: {
    category?: string | null;
    search?: string | null;
    maxPrice?: string | null;
    page?: number | null;
    authorId?: string | null;
  }) => {
    const params = new URLSearchParams();
    
    const cat = category === undefined ? activeCategory : category;
    if (cat) params.set("category", cat);
    
    const q = search === undefined ? searchQuery : search;
    if (q) params.set("search", q);
    
    const price = maxPrice === undefined ? maxPriceParam : maxPrice;
    if (price) params.set("maxPrice", price);
    
    const auth = authorId === undefined ? activeAuthorId : authorId;
    if (auth) params.set("authorId", auth);
    
    const p = page === undefined ? pageParam : page;
    if (p) params.set("page", p.toString());
    
    return `/courses?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // Determine if any filter is active
  const hasActiveFilters = !!(activeCategory || activeAuthorId || maxPriceParam);

  return (
    <main className="min-h-screen bg-background text-foreground py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Simple Header */}
        <div className="mb-8 md:mb-10 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 mb-3 md:mb-4">
              <GraduationCap className="size-4" />
              Chương trình học
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
              Tất cả khóa học
            </h1>
            <p className="mt-1.5 md:mt-2 text-sm md:text-lg text-muted-foreground">
              Khám phá các khóa học thực chiến từ chuyên gia để nâng tầm kỹ năng của bạn.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <SearchInput />
            <Button asChild variant="outline" className="shrink-0">
              <Link href="/">Quay về trang chủ</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <details className="lg:hidden mb-6 group">
          <summary className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-indigo-600" />
              <span className="text-sm font-semibold text-slate-700">Bộ lọc</span>
              {hasActiveFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                  !
                </span>
              )}
            </div>
            <svg className="size-4 text-slate-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </summary>
          <div className="mt-3 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-in slide-in-from-top-2 duration-200">
            {/* Price Filter */}
            <PriceFilter maxPriceLimit={maxPriceLimit} />

            {/* Category Filter */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Lọc theo danh mục</span>
              <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
                <Link
                  href={createFilterLink({ category: null, page: 1 })}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all duration-200 ${
                    !activeCategory
                      ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/50"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium border border-transparent"
                  }`}
                >
                  <span>Tất cả</span>
                  <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold ${
                    !activeCategory ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-500"
                  }`}>
                    {allCoursesCount}
                  </span>
                </Link>
                
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.slug;
                  return (
                    <Link
                      key={cat.id}
                      href={createFilterLink({ category: cat.slug, page: 1 })}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/50"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium border border-transparent"
                      }`}
                    >
                      <span className="line-clamp-1">{cat.name}</span>
                      <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold flex-shrink-0 ${
                        isActive ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-500"
                      }`}>
                        {cat._count.courses}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Author Filter */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Lọc theo giảng viên</span>
              <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
                <Link
                  href={createFilterLink({ authorId: null, page: 1 })}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all duration-200 ${
                    !activeAuthorId
                      ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/50"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium border border-transparent"
                  }`}
                >
                  <span>Tất cả</span>
                  <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold ${
                    !activeAuthorId ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-500"
                  }`}>
                    {allCoursesCount}
                  </span>
                </Link>

                {authors.map((auth) => {
                  const isActive = activeAuthorId === auth.id;
                  return (
                    <Link
                      key={auth.id}
                      href={createFilterLink({ authorId: auth.id, page: 1 })}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/50"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {auth.image ? (
                          <img
                            src={auth.image}
                            alt={auth.name}
                            className="size-5 rounded-full object-cover flex-shrink-0 border border-slate-100"
                          />
                        ) : (
                          <div className="size-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-slate-500">
                            {auth.name.charAt(0)}
                          </div>
                        )}
                        <span className="line-clamp-1">{auth.name}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold flex-shrink-0 ${
                        isActive ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-500"
                      }`}>
                        {auth._count.courses}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </details>

        {/* Main Content Layout with Sidebar */}
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          
          {/* Sidebar Filters — Desktop only */}
          <aside className="hidden lg:block space-y-6">
            {/* Price Filter Slider */}
            <div>
              <PriceFilter maxPriceLimit={maxPriceLimit} />
            </div>

            {/* Category Filter Vertical List */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Lọc theo danh mục</span>
              <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                <Link
                  href={createFilterLink({ category: null, page: 1 })}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all duration-200 ${
                    !activeCategory
                      ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/50"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium border border-transparent"
                  }`}
                >
                  <span>Tất cả</span>
                  <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold ${
                    !activeCategory ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-500"
                  }`}>
                    {allCoursesCount}
                  </span>
                </Link>
                
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.slug;
                  return (
                    <Link
                      key={cat.id}
                      href={createFilterLink({ category: cat.slug, page: 1 })}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/50"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium border border-transparent"
                      }`}
                    >
                      <span className="line-clamp-1">{cat.name}</span>
                      <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold flex-shrink-0 ${
                        isActive ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-500"
                      }`}>
                        {cat._count.courses}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Author Filter Vertical List */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Lọc theo giảng viên</span>
              <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                <Link
                  href={createFilterLink({ authorId: null, page: 1 })}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all duration-200 ${
                    !activeAuthorId
                      ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/50"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium border border-transparent"
                  }`}
                >
                  <span>Tất cả</span>
                  <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold ${
                    !activeAuthorId ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-500"
                  }`}>
                    {allCoursesCount}
                  </span>
                </Link>

                {authors.map((auth) => {
                  const isActive = activeAuthorId === auth.id;
                  return (
                    <Link
                      key={auth.id}
                      href={createFilterLink({ authorId: auth.id, page: 1 })}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/50"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {auth.image ? (
                          <img
                            src={auth.image}
                            alt={auth.name}
                            className="size-5 rounded-full object-cover flex-shrink-0 border border-slate-100"
                          />
                        ) : (
                          <div className="size-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-slate-500">
                            {auth.name.charAt(0)}
                          </div>
                        )}
                        <span className="line-clamp-1">{auth.name}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold flex-shrink-0 ${
                        isActive ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-500"
                      }`}>
                        {auth._count.courses}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Course Grid & Pagination Container */}
          <div className="space-y-8">
            {/* Course Grid */}
            <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {dbCourses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={index}
                />
              ))}
              {dbCourses.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <BookOpenCheck className="mx-auto size-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Không tìm thấy khóa học</h3>
                  <p className="mt-1 text-gray-500">
                    {activeCategory || activeAuthorId || searchQuery || maxPriceParam
                      ? "Không tìm thấy khóa học nào phù hợp với bộ lọc đã chọn."
                      : "Các khóa học đang được cập nhật, bạn hãy quay lại sau nhé."}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 md:mt-12 flex items-center justify-center gap-1 sm:gap-1.5">
                <Link
                  href={createFilterLink({ page: currentPage - 1 })}
                  className={`flex items-center gap-1 px-2 sm:px-3 py-2 text-xs font-semibold rounded-lg border bg-white hover:bg-slate-50 transition-colors ${
                    currentPage === 1 ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  <ChevronLeft className="size-4" />
                  <span className="hidden sm:inline">Trước</span>
                </Link>

                {getPageNumbers().map((pageNum, idx) => {
                  if (pageNum === "...") {
                    return (
                      <span
                        key={`dots-${idx}`}
                        className="flex size-8 sm:size-9 items-center justify-center text-slate-400 font-normal text-xs"
                      >
                        ...
                      </span>
                    );
                  }

                  const isActive = pageNum === currentPage;
                  return (
                    <Link
                      key={`page-${pageNum}`}
                      href={createFilterLink({ page: pageNum as number })}
                      className={`flex size-8 sm:size-9 items-center justify-center rounded-lg text-xs transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-500/20"
                          : "border bg-white hover:bg-slate-50 font-semibold text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}

                <Link
                  href={createFilterLink({ page: currentPage + 1 })}
                  className={`flex items-center gap-1 px-2 sm:px-3 py-2 text-xs font-semibold rounded-lg border bg-white hover:bg-slate-50 transition-colors ${
                    currentPage === totalPages ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  <span className="hidden sm:inline">Sau</span>
                  <ChevronRight className="size-4" />
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
