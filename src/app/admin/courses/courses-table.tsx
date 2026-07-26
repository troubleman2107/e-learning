"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
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
import { Pencil, Settings } from "lucide-react";
import { stripHtml } from "@/lib/utils";
import { PublishToggle } from "./publish-toggle";

interface CourseWithDetails {
  id: string;
  title: string;
  description: string;
  price: number;
  isPublished: boolean;
  category: { id: string; name: string } | null;
  _count: { orders: number };
}

const HEADERS = [
  { key: "title", label: "Tên khóa học", defaultWidth: 240 },
  { key: "actions", label: "Hành động", defaultWidth: 160 },
  { key: "category", label: "Danh mục", defaultWidth: 140 },
  { key: "price", label: "Giá", defaultWidth: 120 },
  { key: "status", label: "Trạng thái", defaultWidth: 130 },
  { key: "orders", label: "Đơn hàng", defaultWidth: 100 },
  { key: "createdAt", label: "Ngày tạo", defaultWidth: 120 },
];

export function CoursesTable({ courses }: { courses: CourseWithDetails[] }) {
  const [colWidths, setColWidths] = useState<number[]>(
    HEADERS.map((h) => h.defaultWidth)
  );

  const resizingColIndex = useRef<number | null>(null);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (resizingColIndex.current === null) return;
    const deltaX = e.clientX - startX.current;
    const newWidth = Math.max(70, startWidth.current + deltaX);

    setColWidths((prev) => {
      const next = [...prev];
      if (resizingColIndex.current !== null) {
        next[resizingColIndex.current] = newWidth;
      }
      return next;
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    resizingColIndex.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = (colIdx: number, e: React.MouseEvent) => {
    e.preventDefault();
    resizingColIndex.current = colIdx;
    startX.current = e.clientX;
    startWidth.current = colWidths[colIdx];

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="rounded-xl border border-gray-200/60 bg-white shadow-sm overflow-x-auto">
      <Table style={{ tableLayout: "fixed" }} className="w-full">
        <TableHeader>
          <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
            {HEADERS.map((header, idx) => (
              <TableHead
                key={header.key}
                style={{ width: `${colWidths[idx]}px` }}
                className="relative font-semibold text-gray-600 select-none group/head py-3 px-3 overflow-hidden text-ellipsis whitespace-nowrap"
              >
                <span>{header.label}</span>
                {/* Drag handle line */}
                <div
                  onMouseDown={(e) => handleMouseDown(idx, e)}
                  className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize flex items-center justify-center group-hover/head:bg-indigo-500/20 active:bg-indigo-600 transition-colors z-20"
                  title="Kéo để thay đổi độ rộng cột"
                >
                  <div className="w-[2px] h-4 bg-gray-300 group-hover/head:bg-indigo-500 transition-colors" />
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id} className="group hover:bg-slate-50/60">
              {/* Tên khóa học */}
              <TableCell style={{ width: `${colWidths[0]}px` }} className="overflow-hidden">
                <div className="space-y-0.5">
                  <p className="font-semibold text-gray-900 truncate text-sm" title={course.title}>
                    {course.title}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {stripHtml(course.description)}
                  </p>
                </div>
              </TableCell>

              {/* Hành động */}
              <TableCell style={{ width: `${colWidths[1]}px` }} className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-xs gap-1 text-gray-700 hover:text-indigo-600 border-gray-200 shrink-0"
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
                    className="h-7 px-2 text-xs gap-1 text-gray-600 hover:text-indigo-600 shrink-0"
                  >
                    <Link href={`/admin/courses/${course.id}/edit`}>
                      <Pencil className="h-3.5 w-3.5" />
                      Sửa
                    </Link>
                  </Button>
                </div>
              </TableCell>

              {/* Danh mục */}
              <TableCell style={{ width: `${colWidths[2]}px` }} className="overflow-hidden">
                {course.category ? (
                  <Badge variant="outline" className="font-normal text-gray-600 truncate max-w-full">
                    {course.category.name}
                  </Badge>
                ) : (
                  <span className="text-sm text-gray-400 italic">Chưa phân loại</span>
                )}
              </TableCell>

              {/* Giá */}
              <TableCell style={{ width: `${colWidths[3]}px` }} className="overflow-hidden">
                <Badge
                  variant="secondary"
                  className="bg-emerald-50 font-mono text-emerald-700"
                >
                  {course.price.toLocaleString("vi-VN")}đ
                </Badge>
              </TableCell>

              {/* Trạng thái */}
              <TableCell style={{ width: `${colWidths[4]}px` }} className="overflow-hidden">
                <PublishToggle id={course.id} initialIsPublished={course.isPublished} />
              </TableCell>

              {/* Đơn hàng */}
              <TableCell style={{ width: `${colWidths[5]}px` }} className="overflow-hidden">
                <span className="text-sm text-gray-600 font-medium">
                  {course._count.orders}
                </span>
              </TableCell>

              {/* Ngày tạo */}
              <TableCell style={{ width: `${colWidths[6]}px` }} className="text-sm text-gray-500 whitespace-nowrap overflow-hidden">
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
                colSpan={HEADERS.length}
                className="h-32 text-center text-gray-400"
              >
                Chưa có khóa học nào. Hãy thêm khóa học đầu tiên!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
