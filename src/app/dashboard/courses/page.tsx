import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, GraduationCap, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


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

  // Fetch all completed lesson progress for this user
  const completedProgress = await prisma.lessonProgress.findMany({
    where: {
      userId: session.user.id,
      isCompleted: true,
    },
    select: {
      lessonId: true,
    },
  });
  const completedLessonIds = new Set(completedProgress.map((p) => p.lessonId));

  // Build progress map per course
  const courseProgressMap = new Map<string, { total: number; completed: number }>();
  enrolledCourses.forEach((course) => {
    let total = 0;
    let completed = 0;
    course.modules.forEach((mod) => {
      mod.lessons.forEach((lesson) => {
        total++;
        if (completedLessonIds.has(lesson.id)) {
          completed++;
        }
      });
    });
    courseProgressMap.set(course.id, { total, completed });
  });

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
          {enrolledCourses.map((course, index) => {
            // Count total lessons
            let lessonCount = 0;
            course.modules.forEach((mod) => {
              lessonCount += mod.lessons.length;
            });

            const visuals = [
              "border-teal-100 bg-gradient-to-br from-teal-500/10 to-teal-600/10 text-teal-700",
              "border-sky-100 bg-gradient-to-br from-sky-500/10 to-sky-600/10 text-sky-700",
              "border-amber-100 bg-gradient-to-br from-amber-500/10 to-amber-600/10 text-amber-700",
              "border-rose-100 bg-gradient-to-br from-rose-500/10 to-rose-600/10 text-rose-700"
            ];
            const visualClass = visuals[index % visuals.length];

            return (
              <Card key={course.id} className="group overflow-hidden flex flex-col justify-between border border-slate-200/50 bg-white shadow-sm transition-all hover:shadow-md">
                {/* Course Thumbnail */}
                <div className="relative flex h-32 w-full overflow-hidden border-b border-slate-100 bg-slate-50">
                  <img
                    src={course.thumbnail || "/course-docker.png"}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 right-3 rounded-full bg-emerald-500/90 text-white px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase shadow-sm">
                    Đã sở hữu
                  </span>
                </div>

                <CardHeader className="pb-3 pt-4">
                  {course.category && (
                    <span className="w-fit rounded-full bg-slate-100 px-2.5 py-0.5 text-[9px] font-medium text-slate-600">
                      {course.category.name}
                    </span>
                  )}
                  <CardTitle className="line-clamp-2 text-sm font-semibold text-slate-800 mt-1 min-h-[40px] group-hover:text-violet-700 transition-colors">
                    {course.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pb-3 pt-0 space-y-3">
                  {/* Progress Bar */}
                  {(() => {
                    const progress = courseProgressMap.get(course.id);
                    const percent = progress && progress.total > 0
                      ? Math.round((progress.completed / progress.total) * 100)
                      : 0;
                    return (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                          <span>Tiến độ học tập</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>

                <CardContent className="pb-4 pt-0">
                  <Button asChild className="w-full gap-2 bg-slate-900 text-white hover:bg-violet-600 transition-all font-medium text-xs py-1.5 h-8 shadow-sm">
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
