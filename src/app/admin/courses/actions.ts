"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const courseSchema = z.object({
  title: z.string().min(1, "Tên khóa học không được để trống"),
  description: z.string().min(1, "Mô tả không được để trống"),
  price: z.coerce.number().int().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  trailerUrl: z.string().url("URL giới thiệu không hợp lệ"),
  bunnyVideoId: z.string().optional(),
});

export async function createCourse(formData: z.infer<typeof courseSchema>) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const validated = courseSchema.parse(formData);

  await prisma.course.create({
    data: {
      title: validated.title,
      description: validated.description,
      price: validated.price,
      trailerUrl: validated.trailerUrl,
      bunnyVideoId: validated.bunnyVideoId,
    },
  });

  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}
