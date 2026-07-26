import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Settings } from "lucide-react";
import { stripHtml } from "@/lib/utils";
import { PublishToggle } from "./publish-toggle";

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

      {/* Courses Table */}
      <div className="rounded-xl border border-gray-200/60 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead className="font-semibold text-gray-600 min-w-[200px]">
                Tên khóa học
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                Hành động
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                Danh mục
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                Giá
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                Trạng thái
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                Đơn hàng
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                Ngày tạo
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id} className="group">
                <TableCell className="max-w-[240px]">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-gray-900 line-clamp-1 text-sm" title={course.title}>
                      {course.title}
                    </p>
                    <p className="line-clamp-1 text-xs text-gray-400">
                      {stripHtml(course.description)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 text-xs gap-1 text-gray-700 hover:text-indigo-600 border-gray-200"
                    >
                      <Link href={`/admin/courses/${course.id}`}>
                        <Settings className="h-3.5 w-3.5 text-indigo-500" />
                        Quản lý
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1 text-gray-600 hover:text-indigo-600"
                    >
                      <Link href={`/admin/courses/${course.id}/edit`}>
                        <Pencil className="h-3.5 w-3.5" />
                        Sửa
                      </Link>
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  {course.category ? (
                    <Badge variant="outline" className="font-normal text-gray-600">
                      {course.category.name}
                    </Badge>
                  ) : (
                    <span className="text-sm text-gray-400 italic">Chưa phân loại</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-emerald-50 font-mono text-emerald-700"
                  >
                    {course.price.toLocaleString("vi-VN")}đ
                  </Badge>
                </TableCell>
                <TableCell>
                  <PublishToggle id={course.id} initialIsPublished={course.isPublished} />
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600 font-medium">
                    {course._count.orders}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                  {new Date(course.id).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }) || "—"}
                </TableCell>
              </TableRow>
            ))}
            {courses.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-gray-400"
                >
                  Chưa có khóa học nào. Hãy thêm khóa học đầu tiên!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
