"use client";

import {
  ArrowRight,
  Award,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  Cloud,
  Dumbbell,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ───────────────────────── DATA ───────────────────────── */

type Category = "all" | "ai" | "aws" | "fitness";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: Category;
  categoryLabel: string;
  originalPrice: string;
  discountedPrice: string;
  rating: string;
  students: string;
}

const courses: Course[] = [
  {
    id: "prompt-engineering-mastery",
    title: "Prompt Engineering Mastery",
    description:
      "Viết prompt chuyên nghiệp cho ChatGPT, Claude, Gemini. Tối ưu output cho marketing, coding và phân tích dữ liệu.",
    thumbnail: "/course-prompt.png",
    category: "ai",
    categoryLabel: "AI & Generative Models",
    originalPrice: "2.499.000đ",
    discountedPrice: "1.299.000đ",
    rating: "4.9",
    students: "1.8k",
  },
  {
    id: "stable-diffusion-pro",
    title: "Stable Diffusion từ Zero đến Pro",
    description:
      "Tạo hình ảnh AI chất lượng cao. Từ cài đặt, training LoRA đến xây dựng workflow ComfyUI cho dự án thực tế.",
    thumbnail: "/course-diffusion.png",
    category: "ai",
    categoryLabel: "AI & Generative Models",
    originalPrice: "3.199.000đ",
    discountedPrice: "1.799.000đ",
    rating: "4.8",
    students: "1.2k",
  },
  {
    id: "ai-full-stack",
    title: "AI Full-Stack: LLM + RAG Pipeline",
    description:
      "Xây dựng ứng dụng AI end-to-end: fine-tune model, vector database, RAG pipeline và deploy lên production.",
    thumbnail: "/course-ai.png",
    category: "ai",
    categoryLabel: "AI & Generative Models",
    originalPrice: "4.999.000đ",
    discountedPrice: "2.999.000đ",
    rating: "5.0",
    students: "890",
  },
  {
    id: "aws-solutions-architect",
    title: "AWS Solutions Architect",
    description:
      "Thiết kế kiến trúc cloud chuyên nghiệp. Bao gồm EC2, S3, Lambda, RDS và chuẩn bị chứng chỉ SAA-C03.",
    thumbnail: "/course-aws.png",
    category: "aws",
    categoryLabel: "Triển khai AWS",
    originalPrice: "3.499.000đ",
    discountedPrice: "1.999.000đ",
    rating: "4.9",
    students: "2.1k",
  },
  {
    id: "docker-kubernetes-aws",
    title: "Docker & Kubernetes trên AWS",
    description:
      "Container hóa ứng dụng, orchestration với K8s, CI/CD pipeline và deploy microservices trên EKS.",
    thumbnail: "/course-docker.png",
    category: "aws",
    categoryLabel: "Triển khai AWS",
    originalPrice: "2.999.000đ",
    discountedPrice: "1.599.000đ",
    rating: "4.7",
    students: "1.5k",
  },
  {
    id: "progressive-overload-science",
    title: "Progressive Overload: Khoa Học Tập Luyện",
    description:
      "Lập trình tập luyện dựa trên khoa học. Periodization, tracking volume, và tối ưu hóa phát triển cơ bắp.",
    thumbnail: "/course-fitness.png",
    category: "fitness",
    categoryLabel: "Fitness & Progressive Overload",
    originalPrice: "1.999.000đ",
    discountedPrice: "999.000đ",
    rating: "4.8",
    students: "3.4k",
  },
];

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

const categoryTabs: { value: Category; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "ai", label: "AI & Generative Models" },
  { value: "aws", label: "Triển khai AWS" },
  { value: "fitness", label: "Fitness & Progressive Overload" },
];

/* ──────────────────────── COMPONENTS ──────────────────── */

function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="group/course overflow-hidden rounded-2xl border-0 bg-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover/course:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <Badge className="absolute left-3 top-3 rounded-lg border-0 bg-white/90 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur-sm">
          {course.categoryLabel}
        </Badge>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2 text-base font-bold leading-snug text-gray-900">
          {course.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-sm leading-relaxed text-gray-500">
          {course.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1 text-amber-500">
            <Star className="size-4 fill-current" />
            {course.rating}
          </span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {course.students} học viên
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t-0 bg-transparent pt-0">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-indigo-600">
            {course.discountedPrice}
          </span>
          <span className="text-sm text-gray-400 line-through">
            {course.originalPrice}
          </span>
        </div>
        <Button
          asChild
          size="sm"
          className="rounded-xl bg-indigo-600 px-4 text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-300"
        >
          <Link href={`/course/${course.id}`}>Đăng ký ngay</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

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

export default function Home() {
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

      {/* ═══════════ FEATURED COURSES ═══════════ */}
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

          {/* Tab filter */}
          <Tabs
            defaultValue="all"

            className="mt-12"
          >
            <div className="flex justify-center">
              <TabsList className="h-auto flex-wrap gap-2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm">
                {categoryTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-indigo-200"
                  >
                    {tab.value === "ai" && (
                      <Brain className="mr-1.5 size-4" />
                    )}
                    {tab.value === "aws" && (
                      <Cloud className="mr-1.5 size-4" />
                    )}
                    {tab.value === "fitness" && (
                      <Dumbbell className="mr-1.5 size-4" />
                    )}
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* All tab contents share the same grid — we use a single content area */}
            {categoryTabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-10">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {(tab.value === "all"
                    ? courses
                    : courses.filter((c) => c.category === tab.value)
                  ).map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
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
