"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống"),
  slug: z.string().min(1, "Slug không được để trống").regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ cái viết thường, số và dấu gạch ngang"),
});

export async function createCategory(data: z.infer<typeof categorySchema>) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const parsed = categorySchema.parse(data);

  await prisma.category.create({
    data: parsed,
  });

  revalidatePath("/admin/categories");
}

export async function updateCategory(id: string, data: z.infer<typeof categorySchema>) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const parsed = categorySchema.parse(data);

  await prisma.category.update({
    where: { id },
    data: parsed,
  });

  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.category.delete({
    where: { id },
  });

  revalidatePath("/admin/categories");
}
