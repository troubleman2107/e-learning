import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { generateBunnyToken } from "@/lib/bunny";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlayCircle } from "lucide-react";

export default async function LearnCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();

  // 1. Check session
  if (!session?.user) {
    redirect("/");
  }

  const { courseId } = await params;

  // 2. Fetch the order and course
  // Note: We use "PAID" instead of "COMPLETED" based on the schema's OrderStatus enum
  const order = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      courseId: courseId,
      status: "PAID",
    },
    include: {
      course: true,
    },
  });

  // 3. If no completed order, or course doesn't exist
  if (!order || !order.course) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-gray-50 px-4">
        <div className="mx-auto max-w-md rounded-2xl border border-gray-200/60 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Bạn chưa mua khóa học này
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            Bạn cần phải thanh toán để có thể truy cập vào nội dung bài giảng.
          </p>
          <Button asChild className="w-full gap-2">
            <Link href={`/course/${courseId}`}>
              <ArrowLeft className="h-4 w-4" />
              Quay lại trang giới thiệu
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const course = order.course;

  // 4. Generate secure token
  const secureIframeUrl = course.bunnyVideoId
    ? generateBunnyToken(course.bunnyVideoId)
    : "";

  return (
    <div className="min-h-screen bg-gray-50 pb-12 pt-6">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Navigation / Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại Dashboard
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <PlayCircle className="h-4 w-4" />
            Đang học
          </div>
        </div>

        {/* Video Player Section */}
        <div className="overflow-hidden rounded-2xl border border-gray-200/60 bg-black shadow-xl">
          <div className="relative aspect-video w-full bg-black">
            {secureIframeUrl ? (
              <iframe
                src={secureIframeUrl}
                loading="lazy"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen={true}
                className="absolute left-0 top-0 h-full w-full border-none"
              ></iframe>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                Khóa học này chưa được cập nhật video.
              </div>
            )}
          </div>
        </div>

        {/* Course Info */}
        <div className="mt-8 rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {course.title}
          </h1>
          <div className="mt-6 border-t border-gray-100 pt-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Giới thiệu nội dung
            </h2>
            <div className="prose prose-indigo max-w-none text-gray-600">
              {course.description.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
