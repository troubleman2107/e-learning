"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { deleteCloudinaryImage } from "@/app/actions/cloudinary";

const authorSchema = z.object({
  name: z.string().optional().default("Giảng viên"),
  title: z.string().optional().default("Chuyên gia"),
  bio: z.string().optional().default(""),
  details: z.string().optional().default(""),
  image: z.string().optional().default("/course-ai.png"),
  rating: z.string().optional().default("4.9"),
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

  // Delete old Cloudinary image if replaced
  const existingAuthor = await prisma.author.findUnique({
    where: { id },
    select: { image: true },
  });

  if (
    existingAuthor?.image &&
    validated.image &&
    existingAuthor.image !== validated.image
  ) {
    await deleteCloudinaryImage(existingAuthor.image);
  }

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

  const author = await prisma.author.findUnique({
    where: { id },
    select: { image: true },
  });

  if (author?.image) {
    await deleteCloudinaryImage(author.image);
  }

  await prisma.author.delete({
    where: { id },
  });

  revalidatePath("/admin/authors");
}
