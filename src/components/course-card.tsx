import Link from "next/link";
import { Star, StarHalf } from "lucide-react";
import { stripHtml } from "@/lib/utils";

export interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
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
  };
  index?: number;
}

export function CourseCard({ course, index = 0 }: CourseCardProps) {
  const thumbnailSrc = course.thumbnail || "/course-docker.png";
  const categoryName = course.category?.name || course.categoryName || "Mọi trình độ";
  const studentCount = course._count?.orders ?? course.studentCount ?? 0;
  
  // Simulate rating stats to match attachment design (e.g. 4.7 stars)
  const ratingValue = 4.7;
  const simulatedReviewsCount = studentCount * 3 + 12;

  const formatVnd = (amount: number) => {
    return `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
  };

  const originalPrice = course.price * 2;

  return (
    <Link
      href={`/course/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md h-full"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-gray-100 bg-slate-50">
        <img
          src={thumbnailSrc}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Category badge overlay */}
        <span className="absolute right-2 top-2 rounded bg-slate-900/80 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
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
          VietLearn Academy
        </p>

        {/* Short Summary */}
        <p className="line-clamp-2 min-h-[2rem] text-[11px] text-gray-500 mt-1.5 leading-relaxed">
          {course.shortDescription || stripHtml(course.description)}
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

        {/* Pricing Block */}
        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="text-sm sm:text-base font-extrabold text-gray-900">
            {course.price === 0 ? "Miễn phí" : formatVnd(course.price)}
          </span>
          {course.price > 0 && (
            <span className="text-[10px] sm:text-xs text-gray-400 line-through font-normal">
              {formatVnd(originalPrice)}
            </span>
          )}
        </div>

        {/* Bestseller Badge */}
        {studentCount > 0 && (
          <span className="mt-2 rounded bg-violet-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wide w-fit">
            Bestseller
          </span>
        )}
      </div>
    </Link>
  );
}
