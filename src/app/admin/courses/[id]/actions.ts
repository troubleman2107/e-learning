"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const lastLesson = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { order: "desc" },
  });

  const nextOrder = lastLesson ? lastLesson.order + 1 : 1;

  await prisma.lesson.create({
    data: {
      title,
      bunnyVideoId,
      isFreePreview,
      moduleId,
      order: nextOrder,
    },
  });

  revalidatePath(`/admin/courses/${courseId}`);
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

  await prisma.module.delete({
    where: { id: moduleId },
  });

  revalidatePath(`/admin/courses/${courseId}`);
}
