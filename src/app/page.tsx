import {
  ArrowRight,
  Award,
  BookOpenCheck,
  GraduationCap,
  Infinity,
  MessageSquareQuote,
  QrCode,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { CourseTabs } from "./course-tabs";

/* ───────────────────────── STATIC DATA ───────────────────────── */

const trustBadges = [
  { icon: QrCode, label: "Thanh toán QR tự động" },
  { icon: Infinity, label: "Học trọn đời" },
  { icon: Target, label: "Thực chiến 100%" },
  { icon: ShieldCheck, label: "Hoàn tiền 7 ngày" },
];

const benefits = [
  {
    icon: Rocket,
    title: "Lộ trình thực chiến",
    description:
      "Mỗi khóa học được thiết kế theo dự án thực tế, giúp bạn có portfolio ngay khi hoàn thành.",
  },
  {
    icon: Users,
    title: "Cộng đồng hỗ trợ 24/7",
    description:
      "Tham gia nhóm Discord riêng với 2000+ học viên và mentor sẵn sàng hỗ trợ mọi lúc.",
  },
  {
    icon: TrendingUp,
    title: "Cập nhật liên tục",
    description:
      "Nội dung khóa học được update theo xu hướng mới nhất, đảm bảo bạn luôn đi trước thị trường.",
  },
];

const testimonials = [
  {
    name: "Nguyễn Minh Tuấn",
    role: "AI Engineer @ FPT Software",
    avatar: "MT",
    content:
      "Khóa AI Full-Stack giúp mình chuyển từ backend developer sang AI engineer trong 3 tháng. Bài tập RAG pipeline thực tế hơn bất kỳ khóa học nào mình từng học.",
    rating: 5,
  },
  {
    name: "Trần Thị Hương",
    role: "DevOps Lead @ Tiki",
    avatar: "TH",
    content:
      "Docker & K8s trên AWS là khóa duy nhất dạy đúng stack mà công ty Việt Nam dùng. Mình đã apply ngay vào dự án và tiết kiệm 40% chi phí cloud.",
    rating: 5,
  },
  {
    name: "Lê Hoàng Nam",
    role: "Fitness Coach & Content Creator",
    avatar: "LN",
    content:
      "Progressive Overload giúp mình hiểu sâu về periodization. Giờ mình tự tin lập trình tập cho cả bản thân và 200+ clients của mình.",
    rating: 5,
  },
];

/* ──────────────────── VISUAL HELPERS ──────────────────── */

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

/* ───────────────────────── PAGE ────────────────────────── */

export default async function Home() {
  /* Fetch real courses from database */
  const dbCourses = await prisma.course.findMany({
    include: {
      category: true,
      _count: {
        select: {
          orders: true,
          modules: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  /* Build categories from DB data for tab filtering */
  const categoryMap = new Map<string, string>();
  for (const course of dbCourses) {
    if (course.category) {
      categoryMap.set(course.category.slug, course.category.name);
    }
  }
  const categories = Array.from(categoryMap.entries()).map(([slug, name]) => ({
    slug,
    name,
  }));

  /* Serialize courses for the client component */
  const serializedCourses = dbCourses.map((course, index) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    price: course.price,
    categoryName: course.category?.name || "Mọi trình độ",
    categorySlug: course.category?.slug || "uncategorized",
    moduleCount: course._count.modules,
    studentCount: course._count.orders,
    visualIndex: index,
  }));

  return (
    <main className="min-h-screen bg-gray-50/50">
      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950">
        {/* Decorative grid & glow */}
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60" />
        <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-violet-500/15 blur-[120px]" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
          {/* Left — Copy */}
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300 backdrop-blur-sm">
              <Sparkles className="size-4" />
              E-learning thực chiến cho người Việt
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Hệ Thống Đào Tạo{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                Thực Chiến
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-300/90">
              Nắm vững AI, Cloud và kỹ năng trending với khóa học thiết kế riêng
              cho thị trường Việt Nam. Học từ chuyên gia, thực hành ngay trên dự
              án thật.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-xl bg-indigo-600 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-500/40"
              >
                <a href="#courses">
                  Khám phá khóa học
                  <ArrowRight className="ml-2 size-5" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-xl border-gray-600 bg-transparent px-8 text-base font-semibold text-gray-200 transition-all hover:border-gray-500 hover:bg-white/5"
              >
                <a href="#testimonials">Xem đánh giá</a>
              </Button>
            </div>

            <div className="mt-8 flex items-center gap-3 text-sm text-gray-400">
              <div className="flex -space-x-2">
                {["MT", "TH", "LN", "KD"].map((initials) => (
                  <div
                    key={initials}
                    className="flex size-8 items-center justify-center rounded-full border-2 border-slate-900 bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-bold text-white"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <span>
                ⭐ <span className="font-semibold text-white">4.9/5</span>{" "}
                (2000+ học viên)
              </span>
            </div>
          </div>

          {/* Right — Hero image */}
          <div className="relative hidden lg:block">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-2 shadow-2xl shadow-indigo-500/10 backdrop-blur-sm">
              <Image
                src="/hero-abstract.png"
                alt="Minh họa hệ thống đào tạo AI hiện đại"
                width={700}
                height={700}
                preload
                className="rounded-2xl object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              {/* Floating stat card */}
              <div className="absolute bottom-6 left-6 rounded-xl border border-white/10 bg-slate-900/80 px-5 py-3 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/20">
                    <TrendingUp className="size-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      +340% tăng trưởng
                    </p>
                    <p className="text-xs text-gray-400">
                      Học viên Q1/2026
                    </p>
                  </div>
                </div>
              </div>
              {/* Floating badge card */}
              <div className="absolute right-6 top-6 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <Award className="size-5 text-amber-400" />
                  <span className="text-sm font-semibold text-white">
                    Top #1 Việt Nam
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TRUST BADGES ═══════════ */}
      <section className="border-b border-gray-200/60 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5 py-5 sm:px-6 lg:justify-between lg:px-8">
          {trustBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.label}
                className="flex items-center gap-2.5 text-sm font-medium text-gray-600"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-50">
                  <Icon className="size-4.5 text-indigo-600" />
                </div>
                {badge.label}
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════ BENEFITS SECTION ═══════════ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge
              variant="secondary"
              className="mb-4 rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600"
            >
              Tại sao chọn VietLearn?
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Học đúng cách, áp dụng ngay
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Không lý thuyết suông. Mọi khóa học đều xoay quanh dự án thực tế
              và kỹ năng có nhu cầu tuyển dụng cao nhất.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="group relative rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-gray-50/50 p-8 shadow-sm transition-all duration-300 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50"
                >
                  <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="size-6 text-white" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900">
                    {benefit.title}
                  </h3>
                  <p className="leading-relaxed text-gray-500">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURED COURSES (from DB) ═══════════ */}
      <section
        id="courses"
        className="bg-gradient-to-b from-gray-50 to-white py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge
              variant="secondary"
              className="mb-4 rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600"
            >
              Khóa Học Nổi Bật
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Đầu tư đúng kỹ năng, nhận lại gấp 10x
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Các khóa học được thiết kế bởi chuyên gia hàng đầu, cập nhật nội
              dung liên tục theo thị trường.
            </p>
          </div>

          {/* Tab filter + Course grid — client component for interactivity */}
          <CourseTabs courses={serializedCourses} categories={categories} />

          {serializedCourses.length === 0 && (
            <div className="mt-12 py-20 text-center">
              <BookOpenCheck className="mx-auto size-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Chưa có khóa học nào</h3>
              <p className="mt-1 text-gray-500">Các khóa học đang được cập nhật, bạn hãy quay lại sau nhé.</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section id="testimonials" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge
              variant="secondary"
              className="mb-4 rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600"
            >
              Đánh giá từ học viên
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Học viên nói gì về VietLearn?
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Hơn 2000 học viên đã thay đổi sự nghiệp với các khóa học của
              chúng tôi.
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <Card
                key={t.name}
                className="rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
              >
                <CardContent className="pt-6">
                  <MessageSquareQuote className="mb-4 size-8 text-indigo-200" />
                  <p className="mb-6 leading-relaxed text-gray-600 italic">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <StarRating count={t.rating} />
                </CardContent>
                <CardFooter className="gap-3 rounded-b-2xl border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-sm font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ BOTTOM CTA ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-white/10 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-purple-400/20 blur-[80px]" />

        <div className="relative mx-auto max-w-4xl px-5 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
            <Zap className="size-4" />
            Ưu đãi có hạn
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Sẵn sàng bắt đầu chưa?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-indigo-100">
            Đăng ký ngay hôm nay và nhận giảm giá lên đến 40% cho tất cả khóa
            học. Cơ hội giới hạn — không nên bỏ lỡ.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-14 rounded-2xl bg-white px-10 text-base font-bold text-indigo-700 shadow-lg shadow-indigo-900/30 transition-all hover:bg-gray-50 hover:shadow-xl"
            >
              <a href="#courses">
                <GraduationCap className="mr-2 size-5" />
                Khám phá khóa học ngay
                <ArrowRight className="ml-2 size-5" />
              </a>
            </Button>
          </div>

          <p className="mt-6 text-sm text-indigo-200">
            ✓ Không cần thẻ tín dụng &nbsp;&bull;&nbsp; ✓ Hoàn tiền 7 ngày
            &nbsp;&bull;&nbsp; ✓ Hỗ trợ tiếng Việt
          </p>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-gray-200/60 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-gray-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 VietLearn. Nền tảng đào tạo thực chiến cho người Việt.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="transition-colors hover:text-gray-900">
              Điều khoản
            </a>
            <a href="#" className="transition-colors hover:text-gray-900">
              Bảo mật
            </a>
            <a href="#" className="transition-colors hover:text-gray-900">
              Liên hệ
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
