"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
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
    thumbnailUrl?: string | null;
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
  progressPercent?: number;
  targetHref?: string;
  variant?: "default" | "dark";
  aspectRatio?: "square" | "video" | "16/10";
}

export function CourseCard({
  course,
  index = 0,
  progressPercent,
  targetHref,
  variant = "default",
  aspectRatio,
}: CourseCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isClicked, setIsClicked] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  const isFav = isFavorite(course.id);
  const thumbnailSrc = course.thumbnailUrl || course.thumbnail || "/course-docker.png";
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
  const destination = targetHref || (course.isPaid ? `/learn/${course.id}` : `/course/${course.id}`);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsClicked(true);
    startTransition(() => {
      router.push(destination);
    });
  };

  const isDark = variant === "dark";

  const aspectClass = aspectRatio === "video"
    ? "aspect-video"
    : aspectRatio === "16/10"
    ? "aspect-[16/10]"
    : aspectRatio === "square"
    ? "aspect-square"
    : isDark
    ? "aspect-[16/10]"
    : "aspect-square";

  return (
    <Link
      href={destination}
      onClick={handleClick}
      className={`group flex flex-col overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.01] h-full relative ${
        isDark
          ? "border border-indigo-500/30 bg-slate-900/90 backdrop-blur-xl shadow-2xl hover:bg-slate-800/95 hover:border-indigo-400/60 hover:shadow-[0_12px_32px_0_rgba(99,102,241,0.3)]"
          : "border border-slate-200/80 bg-white/90 backdrop-blur-xs shadow-sm hover:bg-white/75 hover:backdrop-blur-md hover:border-indigo-400/50 hover:shadow-[0_12px_32px_0_rgba(99,102,241,0.18)]"
      } ${
        isLoading ? "pointer-events-none ring-2 ring-indigo-500/50" : ""
      }`}
    >
      {/* Glass sheen highlight & reflection animation on hover */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-xl">
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
          isDark
            ? "bg-gradient-to-tr from-indigo-500/20 via-transparent to-purple-500/20"
            : "bg-gradient-to-tr from-white/30 via-transparent to-indigo-500/10"
        }`} />
        <div className={`absolute -left-full top-0 block h-full w-1/2 -skew-x-12 opacity-0 transition-all duration-1000 ease-out group-hover:left-[150%] group-hover:opacity-100 ${
          isDark
            ? "bg-gradient-to-r from-transparent via-white/20 to-transparent"
            : "bg-gradient-to-r from-transparent via-white/40 to-transparent"
        }`} />
      </div>

      {/* Thumbnail */}
      <div className={`relative ${aspectClass} w-full overflow-hidden rounded-t-xl bg-slate-950 ${
        isDark ? "border-b border-slate-800/80" : "border-b border-gray-100"
      }`}>
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
        {/* Cover tint overlay */}
        <div className="absolute inset-0 bg-slate-950/20 opacity-60 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none z-10" />

        <Image
          src={thumbnailSrc}
          alt={course.title}
          width={800}
          height={800}
          quality={95}
          className={`aspect-square h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isLoading ? "scale-105 blur-[1px]" : ""
          }`}
        />

        {/* Category badge overlay */}
        <span className="absolute right-2 top-2 z-20 rounded bg-slate-900/60 px-2 py-0.5 text-[9px] font-semibold text-white/90 backdrop-blur-md opacity-70 transition-all duration-300 group-hover:opacity-100 group-hover:bg-slate-900/90 group-hover:text-white group-hover:scale-105">
          {categoryName}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5">
        <h3 className={`line-clamp-2 min-h-[2.5rem] text-[13px] sm:text-sm font-bold leading-snug transition-colors ${
          isDark
            ? "text-white group-hover:text-indigo-300"
            : "text-gray-900 group-hover:text-indigo-600"
        }`}>
          {course.title}
        </h3>
        
        {/* Author / Instructor */}
        <p className={`text-[11px] mt-1 font-medium line-clamp-1 ${
          isDark ? "text-emerald-400" : "text-emerald-700"
        }`}>
          {course.author?.name || "VietLearn Academy"}
        </p>

        {/* Short Summary */}
        <p className={`line-clamp-2 min-h-[2rem] text-[11px] mt-1.5 leading-relaxed ${
          isDark ? "text-slate-300/90" : "text-gray-500"
        }`}>
          {course.shortDescription || stripHtml(course.description || "")}
        </p>

        {/* Rating Block */}
        <div className="flex items-center gap-1 mt-2.5">
          <span className={`text-[11px] font-bold ${isDark ? "text-amber-400" : "text-amber-800"}`}>
            {ratingValue}
          </span>
          <div className="flex text-amber-500">
            <Star className="size-3 fill-amber-500" />
            <Star className="size-3 fill-amber-500" />
            <Star className="size-3 fill-amber-500" />
            <Star className="size-3 fill-amber-500" />
            <StarHalf className="size-3 fill-amber-500" />
          </div>
          <span className={`text-[10px] ${isDark ? "text-slate-400" : "text-gray-400"}`}>
            ({simulatedReviewsCount.toLocaleString()})
          </span>
        </div>

        {/* Pricing Block & Bestseller */}
        <div className="mt-2.5 flex items-baseline justify-between gap-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-sm sm:text-base font-extrabold ${
              isDark ? "text-indigo-400" : "text-indigo-600"
            }`}>
              {course.isPaid
                ? "Đã sở hữu"
                : course.price === 0
                ? "Miễn phí"
                : formatVnd(course.price)}
            </span>
            {!course.isPaid && course.price > 0 && (
              <span className={`text-[10px] sm:text-xs line-through font-normal ${
                isDark ? "text-slate-400" : "text-gray-400"
              }`}>
                {formatVnd(originalPrice)}
              </span>
            )}
          </div>
          {studentCount > 0 && (
            <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
              isDark
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "bg-violet-100 text-violet-700"
            }`}>
              Bestseller
            </span>
          )}
        </div>

        {/* Optional Progress Bar for Enrolled Courses */}
        {progressPercent !== undefined && (
          <div className="mt-2.5 space-y-1">
            <div className={`flex items-center justify-between text-[10px] font-semibold ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              <span>Tiến độ học tập</span>
              <span className={`font-bold ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
                {progressPercent}%
              </span>
            </div>
            <div className={`h-1.5 w-full rounded-full overflow-hidden ${
              isDark ? "bg-slate-800" : "bg-slate-100"
            }`}>
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Call To Action Button "Vào học ngay" */}
        <div className="mt-auto pt-3">
          <div
            className={`w-full rounded-xl text-white font-extrabold text-xs py-2.5 px-3 flex items-center justify-center gap-1.5 transition-all duration-300 ${
              isLoading
                ? "bg-indigo-700 opacity-90 shadow-md shadow-indigo-500/20"
                : "bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 group-hover:from-indigo-500 group-hover:to-violet-500 shadow-md shadow-indigo-500/30 group-hover:shadow-lg group-hover:shadow-indigo-500/40 group-hover:scale-[1.01] active:scale-[0.98]"
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
