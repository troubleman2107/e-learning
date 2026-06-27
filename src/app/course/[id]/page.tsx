import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  CreditCard,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
  Star,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CheckoutForm } from "@/components/checkout-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CoursePageProps = {
  params: Promise<{
    id: string;
  }>;
};

const getCourse = cache(async (id: string) => {
  return prisma.course.findUnique({
    where: { id },
  });
});

const formatVnd = (amount: number) => {
  return `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
};

const getYouTubeEmbedUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.replace("www.", "");
    const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
    let videoId = "";

    if (host === "youtu.be") {
      videoId = pathParts[0] ?? "";
    }

    if (host.endsWith("youtube.com")) {
      if (parsedUrl.pathname === "/watch") {
        videoId = parsedUrl.searchParams.get("v") ?? "";
      }

      if (pathParts[0] === "embed" || pathParts[0] === "shorts") {
        videoId = pathParts[1] ?? "";
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  } catch {
    return url;
  }
};

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourse(id);

  if (!course) {
    return {
      title: "Không tìm thấy khóa học | VietLearn",
      description: "Khóa học bạn đang tìm kiếm không tồn tại trên VietLearn.",
    };
  }

  return {
    title: `${course.title} | VietLearn`,
    description: course.description,
    openGraph: {
      title: `${course.title} | VietLearn`,
      description: course.description,
      type: "website",
    },
  };
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { id } = await params;
  const course = await getCourse(id);

  if (!course) {
    notFound();
  }

  const embedUrl = getYouTubeEmbedUrl(course.trailerUrl);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" className="rounded-lg">
          <Link href="/">
            <ArrowLeft data-icon="inline-start" className="size-4" />
            Về trang chủ
          </Link>
        </Button>
      </div>

      <section className="mx-auto w-full max-w-7xl px-5 pb-14 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="relative aspect-video bg-foreground">
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
              referrerPolicy="strict-origin-when-cross-origin"
              src={embedUrl}
              title={`Trailer khóa học ${course.title}`}
            />
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <article>
            <div className="inline-flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
              <BadgeCheck className="size-4" />
              Khóa học đã kiểm duyệt nội dung
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">
              {course.title}
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              {course.description}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Star className="size-4 fill-amber-500 text-amber-500" />
                  4.9/5 đánh giá
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Học viên đánh giá cao vì nội dung ngắn và dễ áp dụng.
                </p>
              </div>
              <div className="rounded-lg border bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <UsersRound className="size-4 text-primary" />
                  Mentor Việt Nam
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Phản hồi bài tập rõ ràng, sát ngữ cảnh công việc tại Việt Nam.
                </p>
              </div>
              <div className="rounded-lg border bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock3 className="size-4 text-primary" />
                  Học linh hoạt
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Xem lại bài học bất cứ lúc nào sau khi hoàn tất thanh toán.
                </p>
              </div>
            </div>

            <Card className="mt-8 rounded-lg bg-white shadow-none">
              <CardHeader>
                <CardTitle>Nội dung bạn nhận được</CardTitle>
                <CardDescription>
                  Thiết kế cho người đi làm cần nâng kỹ năng nhanh và có đầu ra rõ ràng.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                {[
                  "Video bài học theo từng module ngắn",
                  "Tài nguyên tải về sau thanh toán",
                  "Bài tập thực hành theo tình huống thật",
                  "Lộ trình học rõ ràng từ ngày đầu tiên",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </article>

          <aside id="checkout" className="lg:sticky lg:top-6">
            <Card className="rounded-lg bg-white shadow-sm">
              <CardHeader>
                <CardDescription>Giá khóa học</CardDescription>
                <CardTitle className="text-4xl font-semibold">
                  {formatVnd(course.price)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CheckoutForm courseId={course.id} />

                <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <LockKeyhole className="size-4 text-primary" />
                    Thanh toán bảo mật qua cổng được xác thực
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary" />
                    Link tải tài nguyên chỉ hiển thị sau khi mua
                  </div>
                  <div className="flex items-center gap-2">
                    <PlayCircle className="size-4 text-primary" />
                    Truy cập video học ngay sau khi thanh toán
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
}
