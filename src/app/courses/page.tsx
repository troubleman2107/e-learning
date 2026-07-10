import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpenCheck, Clock3, Star, UsersRound, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
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
  searchParams: Promise<{ category?: string; search?: string; page?: string; maxPrice?: string }>;
}) {
  const { 
    category: activeCategory, 
    search: searchQuery, 
    page: pageParam, 
    maxPrice: maxPriceParam 
  } = await searchParams;

  const limit = 12; // Divisible by 2, 3, and 4 for perfect grid rows
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const skip = (currentPage - 1) * limit;
  const currentMaxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;

  const whereClause = {
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
    ],
  };

  const [dbCourses, totalCoursesCount, allCoursesCount, categories, maxPriceRecord] = await Promise.all([
    prisma.course.findMany({
      where: whereClause,
      include: {
        category: true,
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
    prisma.course.count(),
    prisma.category.findMany({
      include: {
        _count: {
          select: {
            courses: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.course.findFirst({
      orderBy: {
        price: "desc",
      },
      select: {
        price: true,
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
  }: {
    category?: string | null;
    search?: string | null;
    maxPrice?: string | null;
    page?: number | null;
  }) => {
    const params = new URLSearchParams();
    
    const cat = category === undefined ? activeCategory : category;
    if (cat) params.set("category", cat);
    
    const q = search === undefined ? searchQuery : search;
    if (q) params.set("search", q);
    
    const price = maxPrice === undefined ? maxPriceParam : maxPrice;
    if (price) params.set("maxPrice", price);
    
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

  return (
    <main className="min-h-screen bg-background text-foreground py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Simple Header */}
        <div className="mb-10 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 mb-4">
              <GraduationCap className="size-4" />
              Chương trình học
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Tất cả khóa học
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
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

        {/* Main Content Layout with Sidebar */}
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          
          {/* Sidebar Filters */}
          <aside className="space-y-6">
            {/* Price Filter Slider */}
            <div>
              <PriceFilter maxPriceLimit={maxPriceLimit} />
            </div>

            {/* Category Filter Vertical List */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Lọc theo danh mục</span>
              <div className="flex flex-col gap-1 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
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
          </aside>

          {/* Course Grid & Pagination Container */}
          <div className="space-y-8">
            {/* Course Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
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
                    {activeCategory 
                      ? "Chưa có khóa học nào thuộc danh mục này."
                      : "Các khóa học đang được cập nhật, bạn hãy quay lại sau nhé."}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-1.5">
                <Link
                  href={createFilterLink({ page: currentPage - 1 })}
                  className={`flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg border bg-white hover:bg-slate-50 transition-colors ${
                    currentPage === 1 ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  <ChevronLeft className="size-4" />
                  Trước
                </Link>

                {getPageNumbers().map((pageNum, idx) => {
                  if (pageNum === "...") {
                    return (
                      <span
                        key={`dots-${idx}`}
                        className="flex size-9 items-center justify-center text-slate-400 font-normal text-xs"
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
                      className={`flex size-9 items-center justify-center rounded-lg text-xs transition-all duration-200 ${
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
                  className={`flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg border bg-white hover:bg-slate-50 transition-colors ${
                    currentPage === totalPages ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  Sau
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
