"use client";

import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Lock,
  PlayCircle,
  ShieldCheck,
  CheckCircle2,
  Star,
  UsersRound,
  Clock3,
  LockKeyhole,
  Folder,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import { CheckoutForm } from "@/components/checkout-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Helper to format VND
const formatVnd = (amount: number) => {
  return `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
};

// Helper for YouTube embed
const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return "";
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

export function CourseClient({
  course,
  hasPurchased,
  initialCompletedLessons = [],
}: {
  course: any;
  hasPurchased: boolean;
  initialCompletedLessons?: string[];
}) {
  const allLessons = course.modules.flatMap((m: any) => m.lessons);
  const firstLesson = allLessons[0];

  const [currentLessonId, setCurrentLessonId] = useState<string | null>(
    firstLesson?.id || null
  );
  const [iframeUrl, setIframeUrl] = useState<string>(
    getYouTubeEmbedUrl(course.trailerUrl)
  );
  const [completedLessons, setCompletedLessons] = useState<string[]>(initialCompletedLessons);

  // Fetch token for current lesson
  useEffect(() => {
    if (!currentLessonId) return;

    const lesson = allLessons.find((l: any) => l.id === currentLessonId);
    if (!lesson) return;

    if (!lesson.isFreePreview && !hasPurchased) {
      setIframeUrl(getYouTubeEmbedUrl(course.trailerUrl));
      return;
    }

    const fetchToken = async () => {
      try {
        const res = await fetch(`/api/lessons/${currentLessonId}/token`);
        if (res.ok) {
          const data = await res.json();
          setIframeUrl(data.url);
        } else {
          setIframeUrl(getYouTubeEmbedUrl(course.trailerUrl));
        }
      } catch (err) {
        setIframeUrl(getYouTubeEmbedUrl(course.trailerUrl));
      }
    };

    fetchToken();
  }, [currentLessonId, hasPurchased, course.trailerUrl]);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for Bunny video completion using Player.js standard
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        
        // Ensure this is a player.js message
        if (data.context === "player.js") {
          console.log("[Player.js Event]:", data);
          
          if (data.event === "ready") {
            // Handshake: tell the iframe we want to listen to 'ended' events
            if (iframeRef.current && iframeRef.current.contentWindow) {
              iframeRef.current.contentWindow.postMessage(
                JSON.stringify({
                  context: "player.js",
                  version: "0.1.11",
                  method: "addEventListener",
                  value: "ended",
                }),
                "*"
              );
              console.log("[Player.js] Requested to listen to 'ended' event");
            }
          }

          if (data.event === "ended") {
            if (!currentLessonId) return;

            // Call progress API
            const res = await fetch("/api/progress", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lessonId: currentLessonId }),
            });

            if (res.ok) {
              setCompletedLessons((prev) => {
                if (!prev.includes(currentLessonId)) {
                  return [...prev, currentLessonId];
                }
                return prev;
              });
              
              // Move to next lesson automatically
              const currentIndex = allLessons.findIndex((l: any) => l.id === currentLessonId);
              if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
                const nextLesson = allLessons[currentIndex + 1];
                if (nextLesson.isFreePreview || hasPurchased) {
                  setCurrentLessonId(nextLesson.id);
                  toast.success("Đã hoàn thành bài học. Tự động chuyển bài tiếp theo.");
                } else {
                  toast.success("Đã hoàn thành bài học.");
                }
              } else {
                toast.success("Đã hoàn thành bài học.");
              }
            } else {
              console.error("Failed to mark lesson as completed", await res.text());
            }
          }
        }
      } catch (err) {
        // Ignore parse errors (e.g. from react devtools or other extensions)
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [currentLessonId, allLessons, hasPurchased]);

  const handleLessonClick = (lesson: any) => {
    if (!lesson.isFreePreview && !hasPurchased) {
      toast.error("Vui lòng mua khóa học để xem bài này");
      return;
    }
    setCurrentLessonId(lesson.id);
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-14 sm:px-6 lg:px-8">
      {/* Video Player */}
      <div className="overflow-hidden rounded-lg border bg-black shadow-sm">
        <div className="relative aspect-video w-full">
          {iframeUrl ? (
            <iframe
              ref={iframeRef}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-none"
              src={iframeUrl}
              title={`Video khóa học`}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              Đang tải video...
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <article>
          <Tabs defaultValue="curriculum" className="w-full">
            <TabsList className="mb-6 h-12 w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="description"
                className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Mô tả
              </TabsTrigger>
              <TabsTrigger
                value="curriculum"
                className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                Vào học
              </TabsTrigger>
            </TabsList>

            {/* Curriculum Tab */}
            <TabsContent value="curriculum" className="mt-0 outline-none">
              <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900">
                  Nội Dung Khóa Học
                </h2>
                {!hasPurchased && (
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-600">
                    <Lock className="h-4 w-4" />
                    Đăng ký khóa học để mở khóa toàn bộ nội dung bài giảng và tài
                    nguyên học tập
                  </div>
                )}

                <div className="mt-6">
                  <Accordion
                    type="multiple"
                    defaultValue={course.modules.map((m: any) => m.id)}
                    className="w-full space-y-4"
                  >
                    {course.modules.map((module: any) => (
                      <AccordionItem
                        key={module.id}
                        value={module.id}
                        className="rounded-lg border bg-gray-50/50 px-4"
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3 text-left font-semibold text-gray-900">
                            <Folder className="h-5 w-5 text-indigo-500" />
                            {module.title}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2">
                          <div className="flex flex-col space-y-1">
                            {module.lessons.map((lesson: any) => {
                              const isLocked =
                                !lesson.isFreePreview && !hasPurchased;
                              const isActive = currentLessonId === lesson.id;

                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => handleLessonClick(lesson)}
                                  className={`group flex items-center justify-between rounded-md px-3 py-3 text-left text-sm transition-colors ${
                                    isActive
                                      ? "bg-indigo-50 text-indigo-700"
                                      : "hover:bg-gray-100/80"
                                  } ${
                                    isLocked
                                      ? "text-gray-400 opacity-80"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <PlayCircle
                                      className={`h-4 w-4 ${
                                        isActive
                                          ? "text-indigo-600"
                                          : isLocked
                                          ? "text-gray-300"
                                          : "text-indigo-400 group-hover:text-indigo-600"
                                      }`}
                                    />
                                    <span
                                      className={
                                        isActive ? "font-medium" : "font-normal"
                                      }
                                    >
                                      {lesson.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {completedLessons.includes(lesson.id) && (
                                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    )}
                                    {isLocked && (
                                      <Lock className="h-4 w-4 text-gray-300" />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </TabsContent>

            {/* Description Tab */}
            <TabsContent value="description" className="mt-0 outline-none">
              <h1 className="mt-2 max-w-4xl text-3xl font-bold leading-tight sm:text-4xl">
                {course.title}
              </h1>

              <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
                <BadgeCheck className="size-4" />
                Khóa học đã kiểm duyệt nội dung
              </div>

              <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {course.description}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Star className="size-4 fill-amber-500 text-amber-500" />
                    4.9/5 đánh giá
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Học viên đánh giá cao vì nội dung ngắn và dễ áp dụng.
                  </p>
                </div>
                <div className="rounded-lg border bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <UsersRound className="size-4 text-primary" />
                    Mentor Việt Nam
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Phản hồi bài tập rõ ràng, sát ngữ cảnh công việc tại Việt
                    Nam.
                  </p>
                </div>
                <div className="rounded-lg border bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock3 className="size-4 text-primary" />
                    Học linh hoạt
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Xem lại bài học bất cứ lúc nào sau khi hoàn tất thanh toán.
                  </p>
                </div>
              </div>

              <Card className="mt-8 rounded-lg bg-white shadow-none">
                <CardHeader>
                  <CardTitle>Nội dung bạn nhận được</CardTitle>
                  <CardDescription>
                    Thiết kế cho người đi làm cần nâng kỹ năng nhanh và có đầu
                    ra rõ ràng.
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
            </TabsContent>
          </Tabs>
        </article>

        {/* Right Aside (Checkout) */}
        <aside id="checkout" className="lg:sticky lg:top-6">
          <Card className="rounded-xl border border-gray-200/60 bg-white shadow-sm">
            <CardHeader>
              <CardDescription>Giá khóa học</CardDescription>
              <CardTitle className="text-4xl font-semibold text-gray-900">
                {formatVnd(course.price)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasPurchased ? (
                <div className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 py-3 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                  Bạn đã sở hữu khóa học này
                </div>
              ) : (
                <CheckoutForm courseId={course.id} />
              )}

              <div className="mt-6 grid gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <LockKeyhole className="size-4 text-indigo-500" />
                  Thanh toán bảo mật qua cổng được xác thực
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-indigo-500" />
                  Link tải tài nguyên chỉ hiển thị sau khi mua
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle className="size-4 text-indigo-500" />
                  Truy cập video học ngay sau khi thanh toán
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}
