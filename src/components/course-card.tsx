"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, StarHalf, Play, Loader2, Heart } from "lucide-react";
import { stripHtml } from "@/lib/utils";
import { useFavorites } from "@/components/favorites-provider";

export interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description?: string;
    shortDescription?: string | null;
    price: number;
    thumbnail?: string | null;
    category?: {
      name: string;
      slug: string;
    } | null;
    categoryName?: string;
    studentCount?: number;
    _count?: {
      orders: number;
      modules: number;
    };
    author?: {
      id: string;
      name: string;
    } | null;
    isPaid?: boolean;
  };
  index?: number;
}

export function CourseCard({ course, index = 0 }: CourseCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isClicked, setIsClicked] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  const isFav = isFavorite(course.id);
  const thumbnailSrc = course.thumbnail || "/course-docker.png";
  const categoryName = course.category?.name || course.categoryName || "Mọi trình độ";
  const studentCount = course._count?.orders ?? course.studentCount ?? 0;
  
  // Simulate rating stats
  const ratingValue = 4.7;
  const simulatedReviewsCount = studentCount * 3 + 12;

  const formatVnd = (amount: number) => {
    return `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
  };

  const originalPrice = course.price * 2;
  const isLoading = isPending || isClicked;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsClicked(true);
    startTransition(() => {
      router.push(`/course/${course.id}`);
    });
  };

  return (
    <Link
      href={`/course/${course.id}`}
      onClick={handleClick}
      className={`group flex flex-col overflow-hidden rounded-xl border border-gray-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md h-full relative ${
        isLoading ? "pointer-events-none ring-2 ring-indigo-500/50" : ""
      }`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-gray-100 bg-slate-50">
        {/* Favorite Heart Toggle Button */}
        <button
          type="button"
          onClick={(e) => toggleFavorite(course, e)}
          title={isFav ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
          className={`absolute left-2.5 top-2.5 z-30 flex size-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer ${
            isFav
              ? "bg-white/95 text-rose-500 shadow-md scale-105 hover:scale-110"
              : "bg-slate-900/40 text-white/80 hover:bg-white hover:text-rose-500 hover:scale-110"
          }`}
        >
          <Heart
            className={`size-4 transition-colors ${
              isFav ? "fill-rose-500 text-rose-500" : "fill-transparent"
            }`}
          />
        </button>

        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-xs text-white animate-fadeIn">
            <Loader2 className="size-7 animate-spin text-indigo-400 mb-1" />
            <span className="text-[10px] font-bold tracking-wide">Đang mở khóa học...</span>
          </div>
        )}
        <img
          src={thumbnailSrc}
          alt={course.title}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isLoading ? "scale-105 blur-[1px]" : ""
          }`}
        />
        {/* Category badge overlay */}
        <span className="absolute right-2 top-2 z-10 rounded bg-slate-900/80 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
          {categoryName}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] sm:text-sm font-bold leading-snug text-gray-900 transition-colors group-hover:text-indigo-600">
          {course.title}
        </h3>
        
        {/* Author / Instructor */}
        <p className="text-[11px] text-emerald-700 mt-1 font-medium line-clamp-1">
          {course.author?.name || "VietLearn Academy"}
        </p>

        {/* Short Summary */}
        <p className="line-clamp-2 min-h-[2rem] text-[11px] text-gray-500 mt-1.5 leading-relaxed">
          {course.shortDescription || stripHtml(course.description || "")}
        </p>

        {/* Rating Block */}
        <div className="flex items-center gap-1 mt-2.5">
          <span className="text-[11px] font-bold text-amber-800">{ratingValue}</span>
          <div className="flex text-amber-500">
            <Star className="size-3 fill-amber-500" />
            <Star className="size-3 fill-amber-500" />
            <Star className="size-3 fill-amber-500" />
            <Star className="size-3 fill-amber-500" />
            <StarHalf className="size-3 fill-amber-500" />
          </div>
          <span className="text-[10px] text-gray-400">
            ({simulatedReviewsCount.toLocaleString()})
          </span>
        </div>

        {/* Pricing Block & Bestseller */}
        <div className="mt-2.5 flex items-baseline justify-between gap-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-extrabold text-indigo-600">
              {course.isPaid
                ? "Đã sở hữu"
                : course.price === 0
                ? "Miễn phí"
                : formatVnd(course.price)}
            </span>
            {!course.isPaid && course.price > 0 && (
              <span className="text-[10px] sm:text-xs text-gray-400 line-through font-normal">
                {formatVnd(originalPrice)}
              </span>
            )}
          </div>
          {studentCount > 0 && (
            <span className="rounded bg-violet-100 text-violet-700 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">
              Bestseller
            </span>
          )}
        </div>

        {/* Call To Action Button "Vào học ngay" */}
        <div className="mt-3 pt-2.5 border-t border-gray-100/80">
          <div
            className={`w-full rounded-lg text-white font-bold text-xs py-2 px-3 flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 ${
              isLoading
                ? "bg-indigo-700 opacity-90 shadow-indigo-300"
                : "bg-indigo-600 group-hover:bg-indigo-700 shadow-indigo-200 group-hover:shadow-md active:scale-[0.98]"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-3.5 animate-spin text-white" />
                <span>Đang tải...</span>
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-white text-white transition-transform group-hover:scale-110" />
                <span>Vào học ngay</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
