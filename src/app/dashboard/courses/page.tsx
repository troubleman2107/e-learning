import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, GraduationCap, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CourseCard } from "@/components/course-card";


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
            const progress = courseProgressMap.get(course.id);
            const percent = progress && progress.total > 0
              ? Math.round((progress.completed / progress.total) * 100)
              : 0;

            return (
              <CourseCard
                key={course.id}
                course={{
                  ...course,
                  isPaid: true,
                }}
                index={index}
                progressPercent={percent}
                targetHref={`/learn/${course.id}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
