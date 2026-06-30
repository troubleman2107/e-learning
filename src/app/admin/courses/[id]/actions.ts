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
