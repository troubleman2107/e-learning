"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  getOrCreateBunnyCollection,
  deleteBunnyVideoEntry,
  deleteBunnyCollection,
} from "@/app/actions/bunny";
import {
  deleteCloudinaryImage,
  createCloudinaryFolder,
  deleteCloudinaryFolder,
} from "@/app/actions/cloudinary";

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

  const newCourse = await prisma.course.create({
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

  // Automatically create Bunny Stream Collection & Cloudinary Folder for the new course
  try {
    await getOrCreateBunnyCollection(newCourse.id, newCourse.title);
  } catch (error) {
    console.error("Failed to auto-create Bunny Stream Collection on course creation:", error);
  }

  try {
    await createCloudinaryFolder(`courses/${newCourse.id}`);
  } catch (error) {
    console.error("Failed to auto-create Cloudinary Folder on course creation:", error);
  }

  revalidatePath("/admin/courses");
  return newCourse;
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

  // Delete old Cloudinary thumbnail if replaced with a new one
  const existingCourse = await prisma.course.findUnique({
    where: { id },
    select: { thumbnail: true },
  });

  if (
    existingCourse?.thumbnail &&
    thumbnailVal &&
    existingCourse.thumbnail !== thumbnailVal
  ) {
    await deleteCloudinaryImage(existingCourse.thumbnail);
  }

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

  // Ensure Bunny Stream Collection exists or is created
  try {
    await getOrCreateBunnyCollection(id, validated.title);
  } catch (error) {
    console.error("Failed to ensure Bunny Stream Collection on course update:", error);
  }

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

export async function deleteCourse(id: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Fetch course collection, lesson videos, and thumbnail to delete from Bunny & Cloudinary
  const course = await prisma.course.findUnique({
    where: { id },
    select: {
      thumbnail: true,
      bunnyCollectionId: true,
      modules: {
        select: {
          lessons: {
            select: { bunnyVideoId: true },
          },
        },
      },
    },
  });

  if (course) {
    if (course.thumbnail) {
      await deleteCloudinaryImage(course.thumbnail);
    }
    for (const moduleItem of course.modules) {
      for (const lesson of moduleItem.lessons) {
        if (lesson.bunnyVideoId) {
          await deleteBunnyVideoEntry(lesson.bunnyVideoId);
        }
      }
    }
    if (course.bunnyCollectionId) {
      await deleteBunnyCollection(course.bunnyCollectionId);
    }
    // Delete course folder on Cloudinary
    try {
      await deleteCloudinaryFolder(`courses/${id}`);
    } catch (error) {
      console.error("Failed to delete Cloudinary folder on course deletion:", error);
    }
  }

  await prisma.course.delete({
    where: { id },
  });

  revalidatePath("/admin/courses");
}
