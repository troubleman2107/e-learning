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
import { auth } from "@/lib/auth";
import { FeaturedCourses } from "./featured-courses";
import { HeroCoursesCarousel } from "./hero-courses-carousel";
import { TestimonialCarousel } from "./testimonial-carousel";

/* ───────────────────────── STATIC DATA ───────────────────────── */

const trustBadges = [
  { icon: QrCode, label: "Thanh toán QR tự động" },
  { icon: Infinity, label: "Học trọn đời" },
  { icon: Target, label: "Thực chiến 100%" },
  { icon: ShieldCheck, label: "Hoàn tiền 7 ngày" },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Uy Tín - Chất Lượng",
    description:
      "Được xem trước lộ trình & bài giảng demo trước khi đăng ký — đảm bảo đúng nhu cầu của bạn.",
  },
  {
    icon: Zap,
    title: "Kích Hoạt Nhanh Chóng",
    description:
      "Vào học ngay sau khi thanh toán — tự động kích hoạt tài khoản & nhận quyền truy cập chỉ trong vài giây.",
  },
  {
    icon: TrendingUp,
    title: "Tiết Kiệm Chi Phí",
    description:
      "Chi phí tối ưu nhất thị trường nhưng vẫn đảm bảo giá trị kiến thức thực chiến chuẩn 100%.",
  },
  {
    icon: Rocket,
    title: "Học Trên Mọi Thiết Bị",
    description:
      "Laptop, điện thoại hay tablet — giao diện mượt mà giúp bạn học mọi lúc, mọi nơi.",
  },
  {
    icon: BookOpenCheck,
    title: "Khóa Học Chuẩn Gốc",
    description:
      "Đầy đủ video HD/4K sắc nét, tài liệu đính kèm, source code & bài tập dự án thực tế.",
  },
  {
    icon: Users,
    title: "Hỗ Trợ 24/7",
    description:
      "Cộng đồng 2000+ học viên cùng đội ngũ mentor tận tâm luôn sẵn sàng giải đáp thắc mắc của bạn.",
  },
];

const testimonials = [
  {
    id: "1",
    name: "Nguyễn Minh Tuấn",
    role: "AI Engineer @ FPT Software",
    avatar: "MT",
    label: "Học để đổi ngành",
    content:
      "Khóa AI Full-Stack giúp mình chuyển từ backend developer sang AI engineer trong 3 tháng. Bài tập RAG pipeline thực tế hơn bất kỳ khóa học nào mình từng học.",
    rating: 5,
  },
  {
    id: "2",
    name: "Trần Thị Hương",
    role: "DevOps Lead @ Tiki",
    avatar: "TH",
    label: "Thực chiến kĩ năng",
    content:
      "Docker & K8s trên AWS là khóa duy nhất dạy đúng stack mà công ty Việt Nam dùng. Mình đã apply ngay vào dự án và tiết kiệm 40% chi phí cloud.",
    rating: 5,
  },
  {
    id: "3",
    name: "Lê Hoàng Nam",
    role: "Fitness Coach & Content Creator",
    avatar: "LN",
    label: "Tự học tiết kiệm",
    content:
      "Progressive Overload giúp mình hiểu sâu về periodization. Giờ mình tự tin lập trình tập cho cả bản thân và 200+ clients của mình với chi phí cực kỳ hợp lý.",
    rating: 5,
  },
  {
    id: "4",
    name: "Phạm Đức Anh",
    role: "Frontend Developer @ VNG",
    avatar: "DA",
    label: "Kỹ năng trending",
    content:
      "Next.js App Router & Server Actions giúp mình làm chủ full-stack web hiện đại. Nội dung khóa học ngắn gọn, tập trung thẳng vào làm dự án.",
    rating: 5,
  },
  {
    id: "5",
    name: "Vũ Phương Thảo",
    role: "Marketing Manager @ Shopee",
    avatar: "PT",
    label: "Tăng trưởng doanh số",
    content:
      "Chiến lược Marketing Thực Chiến cung cấp tư duy chạy ads & xây dựng phễu bán hàng cực kỳ rõ ràng. Doanh số shop của mình tăng gấp 3 lần sau 2 tháng.",
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
  const session = await auth();
  let paidCourseIds: string[] = [];

  if (session?.user?.id) {
    const paidOrders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        status: "PAID",
      },
      select: { courseId: true },
    });
    paidCourseIds = paidOrders.map((o) => o.courseId);
  }

  const isDev = process.env.NODE_ENV === "development";

  /* Fetch real courses from database */
  const dbCourses = await prisma.course.findMany({
    where: isDev ? undefined : {
      isPublished: true,
    },
    include: {
      category: true,
      author: true,
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
    shortDescription: course.shortDescription,
    price: course.price,
    categoryName: course.category?.name || "Mọi trình độ",
    categorySlug: course.category?.slug || "uncategorized",
    moduleCount: course._count.modules,
    studentCount: course._count.orders,
    visualIndex: index,
    isPaid: paidCourseIds.includes(course.id),
    thumbnail: course.thumbnail,
    author: course.author
      ? {
          id: course.author.id,
          name: course.author.name,
        }
      : null,
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

            <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
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

          {/* Right — Hero Course Carousel */}
          <div className="relative">
            <HeroCoursesCarousel courses={serializedCourses} />
          </div>
        </div>
      </section>

      {/* ═══════════ TRUST BADGES ═══════════ */}
      <section className="border-b border-gray-200/60 bg-white">
        <div className="mx-auto grid grid-cols-2 sm:flex sm:flex-row sm:flex-wrap items-center justify-items-start sm:justify-between gap-y-3.5 gap-x-6 px-4 py-3 sm:py-5 sm:px-6 lg:justify-between lg:px-8 max-w-sm sm:max-w-7xl">
          {trustBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.label}
                className="flex items-center gap-2 text-xs sm:gap-2.5 sm:text-sm font-medium text-gray-600"
              >
                <div className="flex size-8 sm:size-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                  <Icon className="size-4 sm:size-4.5 text-indigo-600" />
                </div>
                <span className="leading-tight">{badge.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════ BENEFITS SECTION (khoahocre.com khr-why inspired) ═══════════ */}
      <section className="bg-gradient-to-b from-white via-indigo-50/20 to-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-3 rounded-full bg-indigo-100/70 px-4 py-1 text-xs font-bold text-indigo-700 border border-indigo-200/60"
            >
              Tại sao chọn VietLearn?
            </Badge>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Tại Sao Bạn Nên Lựa Chọn{" "}
              <span className="relative inline-block text-indigo-600">
                VietLearn
                <span className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-indigo-500/30" />
              </span>
              ?
            </h2>

            {/* Accent Line */}
            <div className="mx-auto my-4 h-0.5 w-16 rounded-full bg-indigo-600/60" />

            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-medium">
              Không lý thuyết suông — Học đúng cách, áp dụng ngay trên dự án thực tế với lộ trình bài bản & chi phí tối ưu.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="group relative rounded-2xl border border-indigo-100/90 bg-white p-6 text-center shadow-sm shadow-indigo-100/40 transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10"
                >
                  <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-indigo-500/30">
                    <Icon className="size-6 transition-transform duration-300 group-hover:rotate-6" />
                  </div>
                  <h3 className="mb-2 text-base sm:text-lg font-bold text-slate-900">
                    {benefit.title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-500 font-normal">
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
        className="bg-gradient-to-b from-gray-50/80 to-white py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          {serializedCourses.length > 0 ? (
            <FeaturedCourses
              courses={serializedCourses}
              categories={categories}
            />
          ) : (
            <div className="py-20 text-center">
              <BookOpenCheck className="mx-auto size-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                Chưa có khóa học nào
              </h3>
              <p className="mt-1 text-gray-500">
                Các khóa học đang được cập nhật, bạn hãy quay lại sau nhé.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS (khoahocre.com khrT5 inspired slider) ═══════════ */}
      <section id="testimonials" className="bg-gradient-to-b from-slate-50/50 via-white to-slate-50/40 py-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mx-auto max-w-3xl text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Cộng Đồng Nói Gì Về{" "}
              <span className="relative inline-block text-indigo-600">
                VietLearn
                <span className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-indigo-500/30" />
              </span>
              ?
            </h2>

            <p className="mt-3 text-sm sm:text-base text-slate-500 font-medium max-w-xl mx-auto">
              Trải nghiệm thực tế từ những người học đang sử dụng nền tảng mỗi ngày
            </p>

            <div className="mx-auto mt-3.5 h-0.5 w-16 rounded-full bg-indigo-600/60" />
          </div>

          {/* Interactive Slider Track */}
          <TestimonialCarousel testimonials={testimonials} />
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

          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
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

          <p className="mt-6 text-xs sm:text-sm text-indigo-200">
            <span className="inline-block">✓ Không cần thẻ tín dụng</span>{" "}
            <span className="hidden sm:inline">&bull;</span>{" "}
            <span className="inline-block">✓ Hoàn tiền 7 ngày</span>{" "}
            <span className="hidden sm:inline">&bull;</span>{" "}
            <span className="inline-block">✓ Hỗ trợ tiếng Việt</span>
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
