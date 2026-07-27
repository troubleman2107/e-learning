import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock } from "lucide-react";
import { LearnClient } from "./learn-client";

export default async function LearnCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams?: Promise<{ lessonId?: string }>;
}) {
  const session = await auth();

  // 1. Check session
  if (!session?.user) {
    redirect("/");
  }

  const { courseId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const lessonId = resolvedSearchParams.lessonId;

  const isAdmin = session.user.role === "ADMIN";

  // 2. Fetch order to verify payment (unless admin)
  if (!isAdmin) {
    const order = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        courseId: courseId,
        status: "PAID",
      },
    });

    if (!order) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-white">
          <div className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              <Lock className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">
              Bạn chưa đăng ký khóa học này
            </h2>
            <p className="mb-6 text-xs sm:text-sm text-slate-400">
              Bạn cần hoàn tất thanh toán để truy cập vào toàn bộ bài giảng chất lượng cao.
            </p>
            <Button asChild className="w-full gap-2 bg-purple-600 hover:bg-purple-700 font-bold">
              <Link href={`/course/${courseId}`}>
                <ArrowLeft className="h-4 w-4" />
                Quay lại trang khóa học
              </Link>
            </Button>
          </div>
        </div>
      );
    }
  }

  // 3. Fetch course details with modules & lessons
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      category: true,
      author: true,
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // 4. Fetch user's completed lesson IDs
  const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const completedProgress = await prisma.lessonProgress.findMany({
    where: {
      userId: session.user.id,
      lessonId: { in: allLessonIds },
      isCompleted: true,
    },
    select: { lessonId: true },
  });

  const initialCompletedLessons = completedProgress.map((p) => p.lessonId);

  return (
    <LearnClient
      course={course}
      initialCompletedLessons={initialCompletedLessons}
      initialLessonId={lessonId}
    />
  );
}
