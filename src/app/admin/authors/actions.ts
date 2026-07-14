"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const authorSchema = z.object({
  name: z.string().min(1, "Tên giảng viên không được để trống"),
  title: z.string().min(1, "Chức danh không được để trống"),
  bio: z.string().min(1, "Tiểu sử không được để trống"),
  details: z.string().min(1, "Chi tiết không được để trống"),
  image: z.string().url("URL hình ảnh không hợp lệ"),
  rating: z.string().min(1, "Đánh giá không được để trống"),
});

export async function createAuthor(formData: z.infer<typeof authorSchema>) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const validated = authorSchema.parse(formData);

  await prisma.author.create({
    data: {
      name: validated.name,
      title: validated.title,
      bio: validated.bio,
      details: validated.details,
      image: validated.image,
      rating: validated.rating,
    },
  });

  revalidatePath("/admin/authors");
  redirect("/admin/authors");
}

export async function updateAuthor(
  id: string,
  formData: z.infer<typeof authorSchema>
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const validated = authorSchema.parse(formData);

  await prisma.author.update({
    where: { id },
    data: {
      name: validated.name,
      title: validated.title,
      bio: validated.bio,
      details: validated.details,
      image: validated.image,
      rating: validated.rating,
    },
  });

  revalidatePath("/admin/authors");
  redirect("/admin/authors");
}

export async function deleteAuthor(id: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.author.delete({
    where: { id },
  });

  revalidatePath("/admin/authors");
}
