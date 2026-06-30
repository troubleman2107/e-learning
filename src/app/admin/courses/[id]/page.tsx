import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateModuleModal } from "./module-modal";
import { CreateLessonModal } from "./lesson-modal";
import { EditLessonModal } from "./edit-lesson-modal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

export default async function CourseManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!course) notFound();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1.5 text-gray-500"
          >
            <Link href="/admin/courses">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {course.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý thông tin chung và danh sách bài giảng.
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href={`/admin/courses/${course.id}/edit`}>
            <Settings className="h-4 w-4" />
            Sửa thông tin
          </Link>
        </Button>
      </div>

      {/* Modules Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Quản lý bài giảng
          </h2>
          <CreateModuleModal courseId={course.id} />
        </div>

        {course.modules.length === 0 ? (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex h-32 flex-col items-center justify-center gap-2 text-gray-500">
              <p>Chưa có module nào.</p>
              <p className="text-sm">
                Hãy thêm module đầu tiên để bắt đầu thêm bài giảng.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Accordion
            type="multiple"
            defaultValue={course.modules.map((m) => m.id)}
            className="space-y-4"
          >
            {course.modules.map((module) => (
              <AccordionItem
                key={module.id}
                value={module.id}
                className="rounded-lg border bg-white px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center font-semibold text-gray-900">
                    <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs text-indigo-600">
                      {module.order}
                    </span>
                    {module.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-9 pr-2">
                    {module.lessons.length === 0 ? (
                      <p className="py-2 text-sm text-gray-400">
                        Chưa có bài giảng nào trong module này.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {module.lessons.map((lesson) => (
                          <li
                            key={lesson.id}
                            className="flex flex-col gap-2 rounded-md border border-gray-100 bg-gray-50/50 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-xs text-gray-400">
                                  {lesson.order}.
                               </span>
                                <span className="font-medium text-gray-700">
                                  {lesson.title}
                                </span>
                                {lesson.isFreePreview ? (
                                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                                    Xem thử miễn phí
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                                    Khóa
                                  </span>
                                )}
                              </div>
                              <div className="pl-6 text-xs text-gray-500">
                                Video ID: <span className="font-mono">{lesson.bunnyVideoId}</span>
                              </div>
                            </div>
                            <EditLessonModal lesson={lesson} courseId={course.id} />
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-3">
                      <CreateLessonModal moduleId={module.id} courseId={course.id} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
