import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditCourseForm } from "./edit-form";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <EditCourseForm course={course} />
    </div>
  );
}
