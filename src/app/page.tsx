import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Languages,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const courses = [
  {
    id: "course_business_english",
    title: "Tiếng Anh giao tiếp công việc",
    description: "Luyện phản xạ hội thoại, email và thuyết trình cho môi trường văn phòng.",
    level: "Cơ bản",
    lessons: "42 bài",
    duration: "8 tuần",
    students: "3.2k",
    rating: "4.9",
    price: "699.000đ",
    icon: Languages,
    visual: "border-teal-100 bg-teal-50 text-teal-700",
  },
  {
    id: "course_data_analytics",
    title: "Data Analytics cho người mới",
    description: "Làm chủ spreadsheet, dashboard và tư duy dữ liệu qua bài tập thực tế.",
    level: "Mới bắt đầu",
    lessons: "36 bài",
    duration: "6 tuần",
    students: "2.8k",
    rating: "4.8",
    price: "849.000đ",
    icon: Sparkles,
    visual: "border-sky-100 bg-sky-50 text-sky-700",
  },
  {
    id: "",
    title: "Digital Marketing thực chiến",
    description: "Xây funnel, viết nội dung bán hàng và đo lường hiệu quả chiến dịch.",
    level: "Trung cấp",
    lessons: "48 bài",
    duration: "10 tuần",
    students: "4.1k",
    rating: "4.9",
    price: "999.000đ",
    icon: BriefcaseBusiness,
    visual: "border-amber-100 bg-amber-50 text-amber-700",
  },
  {
    id: "",
    title: "UI/UX Foundation",
    description: "Thiết kế luồng sản phẩm, wireframe và prototype cho app Việt Nam.",
    level: "Cơ bản",
    lessons: "30 bài",
    duration: "5 tuần",
    students: "1.9k",
    rating: "4.7",
    price: "799.000đ",
    icon: BookOpenCheck,
    visual: "border-rose-100 bg-rose-50 text-rose-700",
  },
];

const benefits = [
  "Lộ trình ngắn, rõ đầu ra",
  "Mentor phản hồi bằng tiếng Việt",
  "Bài tập gắn với công việc thật",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-6 lg:px-8">
        <a href="#" className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </span>
          <span>VietLearn</span>
        </a>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a className="transition-colors hover:text-foreground" href="#courses">
            Khóa học
          </a>
          <a className="transition-colors hover:text-foreground" href="#outcomes">
            Cam kết
          </a>
          <a className="transition-colors hover:text-foreground" href="#signup">
            Tư vấn
          </a>
        </nav>
        <Button asChild variant="outline" className="hidden rounded-lg sm:inline-flex">
          <a href="#signup">Nhận lộ trình</a>
        </Button>
      </header>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-5 pb-12 pt-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:pb-16 lg:pt-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
            <ShieldCheck className="size-4" />
            E-learning thực chiến cho người Việt
          </div>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-tight text-foreground sm:text-6xl">
            VietLearn
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Khóa học ngắn, mentor Việt Nam và bài tập sát công việc giúp người đi làm nâng kỹ năng nhanh mà không phải nghỉ việc hay học lan man.
          </p>

          <form
            id="signup"
            className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
          >
            <Input
              aria-label="Email nhận tư vấn"
              className="h-11 rounded-lg bg-white"
              name="email"
              placeholder="Email của bạn"
              type="email"
            />
            <Button className="h-11 rounded-lg px-5" type="submit">
              Bắt đầu miễn phí
              <ArrowRight data-icon="inline-end" className="size-4" />
            </Button>
          </form>

          <div className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg border bg-white shadow-sm">
          <Image
            alt="Học viên Việt Nam học trực tuyến trong không gian hiện đại"
            className="aspect-[16/10] h-auto w-full object-cover"
            height={799}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            src="/hero-vietnam-learning.jpg"
            width={1280}
          />
          <div className="absolute inset-x-4 bottom-4 rounded-lg bg-white/90 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Lớp đang mở tuần này</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  18 cohort mới cho tiếng Anh, data và marketing
                </p>
              </div>
              <Button size="icon" className="rounded-lg" aria-label="Xem video giới thiệu">
                <PlayCircle className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="outcomes"
        className="border-y bg-white/70"
      >
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div>
            <p className="text-3xl font-semibold">12.000+</p>
            <p className="mt-1 text-sm text-muted-foreground">học viên Việt Nam đã tham gia</p>
          </div>
          <div>
            <p className="text-3xl font-semibold">92%</p>
            <p className="mt-1 text-sm text-muted-foreground">hoàn thành module đầu tiên</p>
          </div>
          <div>
            <p className="text-3xl font-semibold">24h</p>
            <p className="mt-1 text-sm text-muted-foreground">thời gian phản hồi từ mentor</p>
          </div>
        </div>
      </section>

      <section id="courses" className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-primary">Khóa học nổi bật</p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
              Lộ trình ngắn cho kỹ năng có nhu cầu cao
            </h2>
          </div>
          <Button asChild variant="outline" className="w-fit rounded-lg">
            <a href="#signup">
              Tư vấn khóa phù hợp
              <ArrowRight data-icon="inline-end" className="size-4" />
            </a>
          </Button>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => {
            const Icon = course.icon;

            return (
              <Card
                key={course.title}
                className="rounded-lg bg-white shadow-none transition hover:-translate-y-1 hover:ring-foreground/20"
              >
                <CardHeader>
                  <div
                    className={`mb-3 flex h-28 items-end justify-between rounded-lg border p-4 ${course.visual}`}
                  >
                    <Icon className="size-9" />
                    <span className="rounded-md bg-white/85 px-2 py-1 text-xs font-medium text-foreground shadow-sm">
                      {course.level}
                    </span>
                  </div>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2">
                        <Clock3 className="size-4" />
                        {course.duration}
                      </span>
                      <span>{course.lessons}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2">
                        <UsersRound className="size-4" />
                        {course.students} học viên
                      </span>
                      <span className="flex items-center gap-1 text-amber-600">
                        <Star className="size-4 fill-current" />
                        {course.rating}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <span className="font-semibold">{course.price}</span>
                  {course.id ? (
                    <Button
                      asChild
                      size="sm"
                      variant="secondary"
                      className="rounded-lg"
                    >
                      <Link href={`/course/${course.id}`}>Xem chi tiết</Link>
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" className="rounded-lg" disabled>
                      Sắp mở
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
