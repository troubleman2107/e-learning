"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { deleteBunnyVideoEntry } from "@/app/actions/bunny";

export async function createModule(courseId: string, title: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Get the highest order number for the current course's modules
  const lastModule = await prisma.module.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
  });

  const nextOrder = lastModule ? lastModule.order + 1 : 1;

  await prisma.module.create({
    data: {
      title,
      courseId,
      order: nextOrder,
    },
  });

  revalidatePath(`/admin/courses/${courseId}`);
}

export async function createLessons({
  moduleId,
  courseId,
  lessons,
}: {
  moduleId: string;
  courseId: string;
  lessons: Array<{
    title: string;
    bunnyVideoId: string;
    isFreePreview: boolean;
  }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const validLessons = lessons.filter(
    (l) => l.title.trim() !== "" && l.bunnyVideoId.trim() !== ""
  );

  if (validLessons.length === 0) {
    throw new Error("Vui lòng nhập ít nhất 1 bài học có đầy đủ Tiêu đề và Video ID.");
  }

  const lastLesson = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { order: "desc" },
  });

  const startOrder = lastLesson ? lastLesson.order + 1 : 1;

  await prisma.$transaction(
    validLessons.map((l, index) =>
      prisma.lesson.create({
        data: {
          title: l.title.trim(),
          bunnyVideoId: l.bunnyVideoId.trim(),
          isFreePreview: Boolean(l.isFreePreview),
          moduleId,
          order: startOrder + index,
        },
      })
    )
  );

  revalidatePath(`/admin/courses/${courseId}`);
}

export async function createLesson({
  moduleId,
  courseId,
  title,
  bunnyVideoId,
  isFreePreview,
}: {
  moduleId: string;
  courseId: string;
  title: string;
  bunnyVideoId: string;
  isFreePreview: boolean;
}) {
  return createLessons({
    moduleId,
    courseId,
    lessons: [{ title, bunnyVideoId, isFreePreview }],
  });
}

export async function updateLesson({
  lessonId,
  courseId,
  title,
  bunnyVideoId,
  isFreePreview,
}: {
  lessonId: string;
  courseId: string;
  title: string;
  bunnyVideoId: string;
  isFreePreview: boolean;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Delete old Bunny video if replaced with a new video
  const existingLesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { bunnyVideoId: true },
  });

  if (
    existingLesson?.bunnyVideoId &&
    bunnyVideoId &&
    existingLesson.bunnyVideoId !== bunnyVideoId
  ) {
    await deleteBunnyVideoEntry(existingLesson.bunnyVideoId);
  }

  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      title,
      bunnyVideoId,
      isFreePreview,
    },
  });

  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteLesson(lessonId: string, courseId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { bunnyVideoId: true },
  });

  if (lesson?.bunnyVideoId) {
    await deleteBunnyVideoEntry(lesson.bunnyVideoId);
  }

  await prisma.lesson.delete({
    where: { id: lessonId },
  });

  revalidatePath(`/admin/courses/${courseId}`);
}

export async function updateModule({
  moduleId,
  courseId,
  title,
}: {
  moduleId: string;
  courseId: string;
  title: string;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.module.update({
    where: { id: moduleId },
    data: { title },
  });

  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteModule(moduleId: string, courseId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Delete all Bunny video entries for lessons in this module
  const lessons = await prisma.lesson.findMany({
    where: { moduleId },
    select: { bunnyVideoId: true },
  });

  for (const lesson of lessons) {
    if (lesson.bunnyVideoId) {
      await deleteBunnyVideoEntry(lesson.bunnyVideoId);
    }
  }

  await prisma.module.delete({
    where: { id: moduleId },
  });

  revalidatePath(`/admin/courses/${courseId}`);
}
