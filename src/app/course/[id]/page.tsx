import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CourseClient } from "./course-client";
import { getBunnyCollectionVideoDurations } from "@/app/actions/bunny";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CoursePageProps = {
  params: Promise<{
    id: string;
  }>;
};

const getCourse = cache(async (id: string) => {
  const course = await prisma.course.findUnique({
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

  if (!course) return null;

  // Sync lesson video durations from Bunny Stream API if missing or 0
  const missingDurations = course.modules
    .flatMap((m) => m.lessons)
    .filter((l) => (!l.duration || l.duration === 0) && l.bunnyVideoId);

  if (missingDurations.length > 0) {
    try {
      const bunnyDurations = await getBunnyCollectionVideoDurations(
        course.bunnyCollectionId || undefined
      );

      for (const module of course.modules) {
        for (const lesson of module.lessons) {
          if ((!lesson.duration || lesson.duration === 0) && lesson.bunnyVideoId) {
            const fetchedSecs = bunnyDurations[lesson.bunnyVideoId];
            if (fetchedSecs && fetchedSecs > 0) {
              lesson.duration = fetchedSecs;
              prisma.lesson
                .update({
                  where: { id: lesson.id },
                  data: { duration: fetchedSecs },
                })
                .catch(() => {});
            }
          }
        }
      }
    } catch (err) {
      console.warn("[getCourse] Failed to sync Bunny durations:", err);
    }
  }

  return course;
});

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourse(id);
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const isDev = process.env.NODE_ENV === "development";

  if (!course || (!course.isPublished && !isAdmin && !isDev)) {
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

  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const isDev = process.env.NODE_ENV === "development";

  if (!course.isPublished && !isAdmin && !isDev) {
    notFound();
  }

  // Check if current user has purchased the course
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
    <main className="min-h-screen bg-gray-50/50">
      <CourseClient
        course={course}
        hasPurchased={hasPurchased}
        initialCompletedLessons={initialCompletedLessons}
        userEmail={session?.user?.email || ""}
      />
    </main>
  );
}
