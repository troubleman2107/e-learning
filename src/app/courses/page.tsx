import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpenCheck, Clock3, Star, UsersRound, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default async function CoursesPage() {
  const dbCourses = await prisma.course.findMany({
    include: {
      category: true,
      _count: {
        select: {
          orders: true,
          modules: true,
        }
      }
    },
    orderBy: {
      id: "desc",
    }
  });

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
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/">Quay về trang chủ</Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dbCourses.map((course, index) => {
            const Icon = BookOpenCheck; // Fallback icon
            const visualClass = visuals[index % visuals.length];
            
            return (
              <Card
                key={course.id}
                className="flex flex-col rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <CardHeader>
                  <div
                    className={`mb-3 flex h-28 items-end justify-between rounded-lg border p-4 ${visualClass}`}
                  >
                    <Icon className="size-9 opacity-80" />
                    <span className="rounded-md bg-white/90 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm">
                      {course.category?.name || "Mọi trình độ"}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2 text-lg leading-tight" title={course.title}>
                    {course.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="grid gap-2.5 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2">
                        <Clock3 className="size-4 opacity-70" />
                        Tự tốc độ
                      </span>
                      <span>{course._count.modules} phần</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2">
                        <UsersRound className="size-4 opacity-70" />
                        {course._count.orders} học viên
                      </span>
                      <span className="flex items-center gap-1 font-medium text-amber-600">
                        <Star className="size-4 fill-current" />
                        4.9
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between border-t border-gray-100 bg-gray-50/50 pt-4">
                  <span className="font-bold text-indigo-700 text-lg">
                    {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString("vi-VN")}đ`}
                  </span>
                  <Button
                    asChild
                    size="sm"
                    className="rounded-lg bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Link href={`/course/${course.id}`}>Xem chi tiết</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
          {dbCourses.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <BookOpenCheck className="mx-auto size-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Chưa có khóa học nào</h3>
              <p className="mt-1 text-gray-500">Các khóa học đang được cập nhật, bạn hãy quay lại sau nhé.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
