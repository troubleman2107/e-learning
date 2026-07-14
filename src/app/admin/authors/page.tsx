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
import { Plus, Pencil, Star } from "lucide-react";
import { DeleteAuthorButton } from "./delete-author-button";

export const dynamic = "force-dynamic";

export default async function AdminAuthorsPage() {
  const authors = await prisma.author.findMany({
    orderBy: { id: "desc" },
    include: {
      _count: {
        select: { courses: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý Giảng viên
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Thêm, sửa, xóa thông tin giảng viên dạy trên hệ thống.
          </p>
        </div>
        <Button asChild className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Link href="/admin/authors/new">
            <Plus className="h-4 w-4" />
            Thêm giảng viên mới
          </Link>
        </Button>
      </div>

      {/* Authors Table */}
      <div className="rounded-xl border border-gray-200/60 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead className="font-semibold text-gray-600 w-[80px]">
                Ảnh
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                Tên giảng viên
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                Chức danh
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                Đánh giá
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                Số khóa học
              </TableHead>
              <TableHead className="text-right font-semibold text-gray-600">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {authors.map((author) => (
              <TableRow key={author.id} className="group">
                <TableCell>
                  <img
                    src={author.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
                    alt={author.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100"
                  />
                </TableCell>
                <TableCell className="max-w-[240px]">
                  <div>
                    <p className="font-medium text-gray-900">{author.name}</p>
                    <p className="mt-0.5 truncate text-xs text-gray-400" title={author.bio}>
                      {author.bio}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600 font-medium">{author.title}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold gap-1">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    {author.rating}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600 font-semibold bg-gray-100 px-2 py-0.5 rounded-md">
                    {author._count.courses}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 text-gray-500 hover:text-indigo-600"
                    >
                      <Link href={`/admin/authors/${author.id}/edit`}>
                        <Pencil className="h-3.5 w-3.5" />
                        Sửa
                      </Link>
                    </Button>
                    <DeleteAuthorButton id={author.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {authors.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-gray-400"
                >
                  Chưa có giảng viên nào. Hãy thêm giảng viên đầu tiên!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
