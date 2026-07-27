"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const courseSchema = z.object({
  title: z.string().optional().default("Khóa học mới"),
  description: z.string().optional().default(""),
  shortDescription: z.string().optional().default(""),
  price: z.coerce.number().optional().default(0),
  trailerUrl: z.string().optional().default(""),
  bunnyVideoId: z.string().optional(),
  categoryId: z.string().optional(),
  authorId: z.string().optional(),
  thumbnail: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  whatYouWillLearn: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export async function createCourse(formData: z.infer<typeof courseSchema>) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const validated = courseSchema.parse(formData);

  const whatYouWillLearnArray = validated.whatYouWillLearn
    ? validated.whatYouWillLearn.split("\n").map((line) => line.trim()).filter(Boolean)
    : [];

  const thumbnailVal = validated.thumbnailUrl || validated.thumbnail || null;

  await prisma.course.create({
    data: {
      title: validated.title,
      description: validated.description,
      shortDescription: validated.shortDescription,
      price: validated.price,
      trailerUrl: validated.trailerUrl || "",
      bunnyVideoId: validated.bunnyVideoId,
      categoryId: validated.categoryId === "none" || !validated.categoryId ? null : validated.categoryId,
      authorId: validated.authorId === "none" || !validated.authorId ? null : validated.authorId,
      thumbnail: thumbnailVal,
      whatYouWillLearn: whatYouWillLearnArray,
      isPublished: validated.isPublished ?? false,
    },
  });

  revalidatePath("/admin/courses");
}

export async function updateCourse(
  id: string,
  formData: z.infer<typeof courseSchema>
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const validated = courseSchema.parse(formData);

  const whatYouWillLearnArray = validated.whatYouWillLearn
    ? validated.whatYouWillLearn.split("\n").map((line) => line.trim()).filter(Boolean)
    : [];

  const thumbnailVal = validated.thumbnailUrl || validated.thumbnail || null;

  await prisma.course.update({
    where: { id },
    data: {
      title: validated.title,
      description: validated.description,
      shortDescription: validated.shortDescription,
      price: validated.price,
      trailerUrl: validated.trailerUrl || "",
      bunnyVideoId: validated.bunnyVideoId,
      categoryId: validated.categoryId === "none" || !validated.categoryId ? null : validated.categoryId,
      authorId: validated.authorId === "none" || !validated.authorId ? null : validated.authorId,
      thumbnail: thumbnailVal,
      whatYouWillLearn: whatYouWillLearnArray,
      isPublished: validated.isPublished ?? false,
    },
  });

  revalidatePath("/admin/courses");
}

export async function toggleCoursePublish(id: string, isPublished: boolean) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.course.update({
    where: { id },
    data: { isPublished },
  });

  revalidatePath("/admin/courses");
}
