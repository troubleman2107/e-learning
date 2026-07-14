import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CourseClient } from "./course-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CoursePageProps = {
  params: Promise<{
    id: string;
  }>;
};

const getCourse = cache(async (id: string) => {
  return prisma.course.findUnique({
    where: { id },
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
});

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourse(id);

  if (!course) {
    return {
      title: "Không tìm thấy khóa học | VietLearn",
      description: "Khóa học bạn đang tìm kiếm không tồn tại trên VietLearn.",
    };
  }

  return {
    title: `${course.title} | VietLearn`,
    description: course.description,
    openGraph: {
      title: `${course.title} | VietLearn`,
      description: course.description,
      type: "website",
    },
  };
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { id } = await params;
  const course = await getCourse(id);

  if (!course) {
    notFound();
  }

  // Check if current user has purchased the course
  const session = await auth();
  let hasPurchased = false;

  if (session?.user?.id) {
    const order = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        courseId: id,
        status: "PAID",
      },
    });
    if (order) {
      hasPurchased = true;
    }
  }

  // Fetch completed lesson IDs for this course
  let initialCompletedLessons: string[] = [];
  if (session?.user?.id) {
    const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const completedProgress = await prisma.lessonProgress.findMany({
      where: {
        userId: session.user.id,
        lessonId: { in: allLessonIds },
        isCompleted: true,
      },
      select: { lessonId: true },
    });
    initialCompletedLessons = completedProgress.map((p) => p.lessonId);
  }

  return (
    <main className="min-h-screen bg-gray-50/50 pb-12 pt-6">
      <div className="mx-auto w-full max-w-7xl px-5 pb-4 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" className="gap-2 text-gray-500">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Về trang chủ
          </Link>
        </Button>
      </div>

      <CourseClient
        course={course}
        hasPurchased={hasPurchased}
        initialCompletedLessons={initialCompletedLessons}
        userEmail={session?.user?.email || ""}
      />
    </main>
  );
}
