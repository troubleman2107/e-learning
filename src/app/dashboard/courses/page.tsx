import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, GraduationCap, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function MyCoursesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  // Fetch paid orders
  const paidOrders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
      status: "PAID",
    },
    include: {
      course: {
        include: {
          category: true,
          modules: {
            include: {
              lessons: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const enrolledCourses = paidOrders.map((order) => order.course);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800">
          Khóa học của tôi
        </h1>
        <p className="mt-1 text-xs md:text-sm text-slate-500">
          Danh sách các khóa học bạn đã mua và có quyền truy cập học tập.
        </p>
      </div>

      {/* Course Grid */}
      {enrolledCourses.length === 0 ? (
        <Card className="border border-slate-200/60 bg-white/80 p-12 text-center shadow-sm">
          <CardHeader className="items-center pb-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400 border border-slate-200/40">
              <GraduationCap className="h-7 w-7" />
            </div>
            <CardTitle className="text-base font-semibold text-slate-700 mt-4">
              Bạn chưa sở hữu khóa học nào
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 max-w-sm mt-1">
              Bắt đầu hành trình nâng cao kỹ năng lập trình và thiết kế hệ thống bằng cách đăng ký khóa học đầu tiên tại VietLearn.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-4">
            <Button asChild className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md hover:from-indigo-600 hover:to-violet-700">
              <Link href="/">Khám phá khóa học ngay</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.map((course) => {
            // Count total lessons
            let lessonCount = 0;
            course.modules.forEach((mod) => {
              lessonCount += mod.lessons.length;
            });

            return (
              <Card key={course.id} className="group flex flex-col justify-between border border-slate-200/50 bg-white shadow-sm transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  {course.category && (
                    <span className="w-fit rounded-full bg-violet-50 border border-violet-100/50 px-2.5 py-0.5 text-[10px] font-medium text-violet-700">
                      {course.category.name}
                    </span>
                  )}
                  <CardTitle className="line-clamp-2 text-sm font-semibold text-slate-800 mt-2 min-h-[40px] group-hover:text-violet-700 transition-colors">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-[11px] text-slate-400 mt-1 min-h-[32px]">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3 border-t border-slate-50 pt-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                      <span>{course.modules.length} chương</span>
                    </div>
                    <div>
                      <span>{lessonCount} bài học</span>
                    </div>
                  </div>
                </CardContent>
                <CardContent className="pb-4 pt-0">
                  <Button asChild className="w-full gap-2 bg-slate-900 text-white hover:bg-violet-600 transition-all font-medium text-xs py-1.5 h-8">
                    <Link href={`/course/${course.id}`}>
                      <Play className="h-3 w-3 fill-current" />
                      Vào học ngay
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
