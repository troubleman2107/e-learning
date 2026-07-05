"use client";

import Link from "next/link";
import { BookOpenCheck, Clock3, Star, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ───────────────────────── TYPES ───────────────────────── */

export interface SerializedCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryName: string;
  categorySlug: string;
  moduleCount: number;
  studentCount: number;
  visualIndex: number;
  isPaid?: boolean;
}

interface CourseTabsProps {
  courses: SerializedCourse[];
  categories: { slug: string; name: string }[];
}

/* ──────────────── VISUAL GRADIENTS ──────────────────────── */

const cardGradients = [
  "from-teal-500/80 to-cyan-600/80",
  "from-sky-500/80 to-blue-600/80",
  "from-amber-500/80 to-orange-600/80",
  "from-rose-500/80 to-pink-600/80",
  "from-indigo-500/80 to-violet-600/80",
  "from-emerald-500/80 to-green-600/80",
];

const cardPatterns = [
  "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)",
  "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)",
  "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 60%)",
  "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)",
  "radial-gradient(circle at 70% 70%, rgba(255,255,255,0.15) 0%, transparent 50%)",
  "radial-gradient(circle at 40% 60%, rgba(255,255,255,0.12) 0%, transparent 60%)",
];

/* ──────────────────── COURSE CARD ──────────────────────── */

function CourseCard({ course }: { course: SerializedCourse }) {
  const gradientClass = cardGradients[course.visualIndex % cardGradients.length];
  const pattern = cardPatterns[course.visualIndex % cardPatterns.length];

  return (
    <Card className="group/course overflow-hidden rounded-2xl border-0 bg-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
      {/* Thumbnail area — gradient with decorative pattern */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`}
          style={{ backgroundImage: pattern }}
        />
        {/* Decorative icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpenCheck className="size-16 text-white/20" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <Badge className="absolute left-3 top-3 rounded-lg border-0 bg-white/90 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur-sm">
          {course.categoryName}
        </Badge>
        {course.moduleCount > 0 && (
          <Badge className="absolute right-3 top-3 rounded-lg border-0 bg-black/50 text-xs font-medium text-white backdrop-blur-sm">
            <Clock3 className="mr-1 size-3" />
            {course.moduleCount} phần
          </Badge>
        )}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2 text-base font-bold leading-snug text-gray-900">
          {course.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-sm leading-relaxed text-gray-500">
          {course.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1 text-amber-500">
            <Star className="size-4 fill-current" />
            4.9
          </span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {course.studentCount} học viên
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t-0 bg-transparent pt-0">
        <span className="text-lg font-bold text-indigo-600">
          {course.isPaid
            ? "Đã sở hữu"
            : course.price === 0
            ? "Miễn phí"
            : `${course.price.toLocaleString("vi-VN")}đ`}
        </span>
        {course.isPaid ? (
          <Button
            asChild
            size="sm"
            className="rounded-xl bg-emerald-600 px-4 text-white shadow-md shadow-emerald-200 transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-300"
          >
            <Link href={`/course/${course.id}`}>Vào học ngay</Link>
          </Button>
        ) : (
          <Button
            asChild
            size="sm"
            className="rounded-xl bg-indigo-600 px-4 text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-300"
          >
            <Link href={`/course/${course.id}`}>Đăng ký ngay</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

/* ──────────────────── COURSE TABS ──────────────────────── */

export function CourseTabs({ courses, categories }: CourseTabsProps) {
  if (courses.length === 0) return null;

  const tabs = [
    { value: "all", label: "Tất cả" },
    ...categories.map((cat) => ({ value: cat.slug, label: cat.name })),
  ];

  return (
    <Tabs defaultValue="all" className="mt-12">
      {/* Only show tabs if there are multiple categories */}
      {categories.length > 1 && (
        <div className="flex justify-center">
          <TabsList className="h-auto flex-wrap gap-2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-indigo-200"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      )}

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {(tab.value === "all"
              ? courses
              : courses.filter((c) => c.categorySlug === tab.value)
            ).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
