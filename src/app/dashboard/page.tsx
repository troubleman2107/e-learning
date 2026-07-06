import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, GraduationCap, Receipt, ArrowRight, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function StudentDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  // Fetch user's paid orders to list enrolled courses
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
  
  // Total stats
  const totalCourses = enrolledCourses.length;
  let totalLessons = 0;
  enrolledCourses.forEach((course) => {
    course.modules.forEach((mod) => {
      totalLessons += mod.lessons.length;
    });
  });

  const stats = [
    {
      label: "Khóa học của tôi",
      value: totalCourses,
      icon: GraduationCap,
      color: "text-violet-600 bg-violet-50 border border-violet-100",
      description: "Khóa học bạn đã mở khóa",
    },
    {
      label: "Tổng số bài học",
      value: totalLessons,
      icon: BookOpen,
      color: "text-indigo-600 bg-indigo-50 border border-indigo-100",
      description: "Bài học sẵn sàng phục vụ",
    },
    {
      label: "Giao dịch thành công",
      value: paidOrders.length,
      icon: Receipt,
      color: "text-emerald-600 bg-emerald-50 border border-emerald-100",
      description: "Hóa đơn đã thanh toán",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-md md:p-8">
        <div className="relative z-10 space-y-2">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Chào mừng trở lại, {session.user.name || "Học viên"}! 👋
          </h1>
          <p className="max-w-xl text-xs md:text-sm text-indigo-100/90 leading-relaxed">
            Hôm nay là một ngày tuyệt vời để nâng cấp bản thân với các kiến thức công nghệ mới nhất. Tiếp tục lộ trình học tập của bạn nào!
          </p>
        </div>
        <div className="absolute top-1/2 -right-8 h-40 w-40 -translate-y-1/2 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 right-16 h-28 w-28 rounded-full bg-white/10 blur-xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border border-slate-200/50 bg-white shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                <CardTitle className="text-2xl font-bold text-slate-800">{stat.value}</CardTitle>
              </div>
              <div className={cn("rounded-lg p-2", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] text-slate-400">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Learning Status / Enrolled Courses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Khóa học học gần đây</h2>
          {totalCourses > 0 && (
            <Link
              href="/dashboard/courses"
              className="group flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        {enrolledCourses.length === 0 ? (
          <Card className="border border-slate-200/60 bg-white/80 p-8 text-center shadow-sm">
            <CardHeader className="items-center pb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 border border-slate-200/40">
                <BookOpen className="h-6 w-6" />
              </div>
              <CardTitle className="text-base font-semibold text-slate-700 mt-4">
                Chưa đăng ký khóa học nào
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 max-w-sm">
                Bạn chưa tham gia khóa học nào tại VietLearn. Khám phá các khóa học công nghệ thực chiến của chúng tôi để bắt đầu ngay!
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-2">
              <Button asChild className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md hover:from-indigo-600 hover:to-violet-700">
                <Link href="/">Khám phá khóa học</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.slice(0, 3).map((course, index) => {
              // Calculate lessons count
              let lessonCount = 0;
              course.modules.forEach((m) => (lessonCount += m.lessons.length));

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
                  <div className={cn("relative flex h-32 items-center justify-center border-b border-slate-100", visualClass)}>
                    <BookOpen className="h-10 w-10 opacity-75" />
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
    </div>
  );
}
