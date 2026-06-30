import { prisma } from "@/lib/prisma";
import { CreateCourseForm } from "./create-course-form";

export default async function NewCoursePage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  return <CreateCourseForm categories={categories} />;
}
