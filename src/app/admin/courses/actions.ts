"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const courseSchema = z.object({
  title: z.string().min(1, "Tên khóa học không được để trống"),
  description: z.string().min(1, "Mô tả không được để trống"),
  shortDescription: z.string().optional(),
  price: z.coerce.number().int().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  trailerUrl: z.string().url("URL giới thiệu không hợp lệ"),
  bunnyVideoId: z.string().optional(),
  categoryId: z.string().optional(),
  authorId: z.string().optional(),
  thumbnail: z.string().optional(),
  whatYouWillLearn: z.string().optional(),
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

  await prisma.course.create({
    data: {
      title: validated.title,
      description: validated.description,
      shortDescription: validated.shortDescription,
      price: validated.price,
      trailerUrl: validated.trailerUrl,
      bunnyVideoId: validated.bunnyVideoId,
      categoryId: validated.categoryId === "none" || !validated.categoryId ? null : validated.categoryId,
      authorId: validated.authorId === "none" || !validated.authorId ? null : validated.authorId,
      thumbnail: validated.thumbnail,
      whatYouWillLearn: whatYouWillLearnArray,
    },
  });

  revalidatePath("/admin/courses");
  redirect("/admin/courses");
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

  await prisma.course.update({
    where: { id },
    data: {
      title: validated.title,
      description: validated.description,
      shortDescription: validated.shortDescription,
      price: validated.price,
      trailerUrl: validated.trailerUrl,
      bunnyVideoId: validated.bunnyVideoId,
      categoryId: validated.categoryId === "none" || !validated.categoryId ? null : validated.categoryId,
      authorId: validated.authorId === "none" || !validated.authorId ? null : validated.authorId,
      thumbnail: validated.thumbnail,
      whatYouWillLearn: whatYouWillLearnArray,
    },
  });

  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}
