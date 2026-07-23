"use client";

import Link from "next/link";
import { Heart, Trash2, ArrowRight, BookOpen, Sparkles, ShieldCheck } from "lucide-react";
import { useFavorites } from "@/components/favorites-provider";
import { CourseCard } from "@/components/course-card";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  const { favoriteCourses, count, removeFavorite, isLoaded } = useFavorites();

  const formatVnd = (amount: number) => {
    return `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
  };

  const totalPrice = favoriteCourses.reduce((acc, course) => acc + (course.price || 0), 0);

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-slate-50/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 animate-pulse space-y-6">
          <div className="h-8 w-64 rounded-xl bg-slate-200" />
          <div className="h-4 w-96 rounded-lg bg-slate-100" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 rounded-2xl border border-slate-200 bg-white p-4 space-y-4" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/50 py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <Heart className="size-5 fill-rose-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Danh Sách Yêu Thích
              </h1>
              <span className="rounded-full bg-rose-500 px-3 py-0.5 text-xs font-extrabold text-white shadow-xs">
                {count}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Quản lý các khóa học bạn đã lưu để học sau hoặc đăng ký nhanh chóng.
            </p>
          </div>

          {count > 0 && (
            <div className="flex items-center gap-3">
              <Link href="/courses">
                <Button
                  variant="outline"
                  className="rounded-xl border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <BookOpen className="mr-1.5 size-4 text-indigo-600" />
                  Tìm thêm khóa học
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Content Section */}
        {count === 0 ? (
          /* Empty State */
          <div className="mx-auto max-w-md py-16 text-center space-y-6">
            <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-rose-50 border border-rose-100 text-rose-500 shadow-sm">
              <Heart className="size-10 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">
                Danh sách yêu thích trống
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                Bạn chưa lưu khóa học nào. Hãy bấm vào biểu tượng hình trái tim trên bất kỳ khóa học nào để lưu lại tại đây!
              </p>
            </div>
            <div className="pt-2">
              <Link href="/courses">
                <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 text-xs sm:text-sm shadow-md shadow-indigo-200 transition-all hover:scale-105 active:scale-95">
                  Khám phá danh sách khóa học
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Favorited Courses Grid */
          <div className="space-y-6">
            {/* Top Bar Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                <Sparkles className="size-4 text-amber-500" />
                <span>Đã chọn <strong className="text-slate-900">{count}</strong> khóa học yêu thích</span>
              </div>
              <div className="flex items-center gap-4 text-xs sm:text-sm font-bold">
                <span className="text-slate-500">Tổng giá trị:</span>
                <span className="text-lg font-black text-indigo-600">
                  {formatVnd(totalPrice)}
                </span>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {favoriteCourses.map((course, idx) => (
                <div key={course.id} className="relative group/fav">
                  <CourseCard course={course} index={idx} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
