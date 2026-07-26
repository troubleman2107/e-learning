import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CoursesTable } from "./courses-table";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { id: "desc" },
    include: {
      category: true,
      _count: {
        select: { orders: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý Khóa học
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Thêm, sửa, xóa các khóa học trên hệ thống.
          </p>
        </div>
        <Button asChild className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Link href="/admin/courses/new">
            <Plus className="h-4 w-4" />
            Thêm khóa học mới
          </Link>
        </Button>
      </div>

      {/* Resizable Courses Table */}
      <CoursesTable courses={courses} />
    </div>
  );
}
