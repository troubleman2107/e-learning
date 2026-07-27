"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  Loader2,
  BookOpen,
  Check,
  Award,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Lesson {
  id: string;
  title: string;
  bunnyVideoId?: string | null;
  isFreePreview: boolean;
  order: number;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  trailerUrl: string;
  bunnyVideoId?: string | null;
  modules: Module[];
}

interface LearnClientProps {
  course: Course;
  initialCompletedLessons: string[];
  initialLessonId?: string;
}

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

// Helper to format non-autoplay video URL
const formatNoAutoplayUrl = (url: string) => {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube") || u.hostname.includes("youtu.be")) {
      u.searchParams.set("autoplay", "0");
    } else {
      u.searchParams.set("autoplay", "false");
    }
    return u.toString();
  } catch {
    return url;
  }
};

export function LearnClient({
  course,
  initialCompletedLessons,
  initialLessonId,
}: LearnClientProps) {
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const firstLesson = allLessons[0];

  const [currentLessonId, setCurrentLessonId] = useState<string>(
    initialLessonId && allLessons.some((l) => l.id === initialLessonId)
      ? initialLessonId
      : firstLesson?.id || ""
  );

  const [completedLessons, setCompletedLessons] = useState<string[]>(
    initialCompletedLessons
  );
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const [isLessonLoading, setIsLessonLoading] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeLesson = allLessons.find((l) => l.id === currentLessonId) || firstLesson;
  const activeModule = course.modules.find((m) =>
    m.lessons.some((l) => l.id === currentLessonId)
  );

  const activeIndex = allLessons.findIndex((l) => l.id === currentLessonId);
  const previousLesson = activeIndex > 0 ? allLessons[activeIndex - 1] : null;
  const nextLesson =
    activeIndex >= 0 && activeIndex < allLessons.length - 1
      ? allLessons[activeIndex + 1]
      : null;

  const totalLessons = allLessons.length;
  const completedCount = completedLessons.length;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Fetch token or fallback URL when currentLessonId changes
  useEffect(() => {
    if (!currentLessonId) return;

    const fetchToken = async () => {
      setIsLessonLoading(true);
      try {
        const res = await fetch(`/api/lessons/${currentLessonId}/token`);
        if (res.ok) {
          const data = await res.json();
          setIframeUrl(formatNoAutoplayUrl(data.url));
        } else {
          setIframeUrl(formatNoAutoplayUrl(getYouTubeEmbedUrl(course.trailerUrl)));
        }
      } catch (err) {
        setIframeUrl(formatNoAutoplayUrl(getYouTubeEmbedUrl(course.trailerUrl)));
      } finally {
        setTimeout(() => setIsLessonLoading(false), 250);
      }
    };

    fetchToken();
  }, [currentLessonId, course.trailerUrl]);

  // Listen for video ended message from player.js
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        if (data.context === "player.js") {
          if (data.event === "ready") {
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
            }
          }

          if (data.event === "ended") {
            if (!currentLessonId) return;
            handleMarkCompleted(currentLessonId, true);
          }
        }
      } catch (err) {
        // Ignore parse errors
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [currentLessonId, nextLesson]);

  // Mark lesson as completed
  const handleMarkCompleted = async (lessonId: string, autoNext = false) => {
    if (completedLessons.includes(lessonId)) {
      if (autoNext && nextLesson) {
        setCurrentLessonId(nextLesson.id);
        toast.info(`Bài tiếp theo: ${nextLesson.title}`);
      }
      return;
    }

    setIsUpdatingProgress(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });

      if (res.ok) {
        setCompletedLessons((prev) => [...prev, lessonId]);
        if (autoNext && nextLesson) {
          toast.success("Đã hoàn thành! Chuyển sang bài tiếp theo.");
          setCurrentLessonId(nextLesson.id);
        } else if (autoNext && !nextLesson) {
          toast.success("Chúc mừng bạn đã hoàn thành toàn bộ bài học!");
        } else {
          toast.success("Đã đánh dấu hoàn thành bài học!");
        }
      } else {
        toast.error("Không thể lưu tiến độ bài học.");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi cập nhật tiến độ.");
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 font-sans flex flex-col">
      {/* ===== LMS TOP CONTROL BAR ===== */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 shadow-xs">
        <div className="mx-auto max-w-[1536px] flex items-center justify-between gap-4">
          {/* Left: Breadcrumbs / Back */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-purple-600 transition-colors bg-slate-100 hover:bg-purple-50 px-3 py-1.5 rounded-xl border border-slate-200/80 shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <span className="h-4 w-px bg-slate-200 shrink-0 hidden sm:block" />

            <div className="min-w-0">
              <Link
                href={`/course/${course.id}`}
                className="text-xs text-slate-500 hover:text-purple-600 truncate block font-medium"
              >
                {course.title}
              </Link>
              <h1 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                {activeLesson?.title || "Không có bài học"}
              </h1>
            </div>
          </div>

          {/* Right: Progress & Sidebar Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Progress Badge */}
            <div className="hidden md:flex items-center gap-3 bg-purple-50/70 border border-purple-200/60 px-3.5 py-1.5 rounded-xl">
              <div className="text-right">
                <span className="text-xs font-bold text-purple-950">
                  {completedCount}/{totalLessons} Bài học
                </span>
                <span className="text-[10px] text-purple-700 font-semibold block">
                  {progressPercent}% hoàn thành
                </span>
              </div>
              <div className="w-20 h-2 bg-purple-200/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Sidebar Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-bold text-xs gap-2 rounded-xl cursor-pointer"
            >
              <Menu className="h-4 w-4 text-purple-600" />
              <span className="hidden sm:inline">
                {isSidebarOpen ? "Ẩn giáo trình" : "Hiện giáo trình"}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* ===== MAIN WORKSPACE PAGE ===== */}
      <main className="flex-1 mx-auto max-w-[1536px] w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* LEFT COLUMN: Main Video Player & Lesson Controls */}
          <div className="flex-1 w-full min-w-0 space-y-6">
            {/* Widescreen 16:9 Video Container */}
            <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800 flex items-center justify-center">
              {isLessonLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-xs text-white">
                  <Loader2 className="h-10 w-10 animate-spin text-purple-400 mb-3" />
                  <p className="text-xs font-semibold tracking-wide text-slate-200">
                    Đang tải bài học...
                  </p>
                </div>
              )}
              {iframeUrl ? (
                <iframe
                  key={currentLessonId}
                  ref={iframeRef}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-none"
                  src={iframeUrl}
                  title={activeLesson?.title || course.title}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
                  <span className="text-xs font-medium">Đang tải video bài học...</span>
                </div>
              )}
            </div>

            {/* Lesson Title & Action Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200/60">
                      {activeModule?.title || "Chương trình học"}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {activeLesson?.title || "Chọn bài học để bắt đầu"}
                  </h2>
                </div>

                {/* Lesson Navigation & Completion Button */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {previousLesson && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentLessonId(previousLesson.id)}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs gap-1.5 rounded-xl cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Bài trước
                    </Button>
                  )}

                  <Button
                    onClick={() =>
                      currentLessonId && handleMarkCompleted(currentLessonId)
                    }
                    disabled={
                      isUpdatingProgress ||
                      Boolean(currentLessonId && completedLessons.includes(currentLessonId))
                    }
                    className={`text-xs font-bold gap-1.5 rounded-xl cursor-pointer shadow-xs transition-all ${
                      currentLessonId && completedLessons.includes(currentLessonId)
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20"
                    }`}
                  >
                    {currentLessonId && completedLessons.includes(currentLessonId) ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100" />
                        Đã hoàn thành
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Hoàn thành bài học
                      </>
                    )}
                  </Button>

                  {nextLesson && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentLessonId(nextLesson.id)}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs gap-1.5 rounded-xl cursor-pointer"
                    >
                      Bài tiếp theo
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Curriculum Navigation Panel */}
          {isSidebarOpen && (
            <div className="w-full lg:w-85 xl:w-90 shrink-0 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-600" />
                  <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                    Giáo trình khóa học
                  </h3>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200/60">
                  {completedCount}/{totalLessons} bài
                </span>
              </div>

              {/* Module & Lesson List */}
              <div className="p-3 space-y-3 max-h-[calc(100vh-14rem)] overflow-y-auto">
                {course.modules.map((module) => {
                  const moduleCompletedCount = module.lessons.filter((l) =>
                    completedLessons.includes(l.id)
                  ).length;

                  return (
                    <div
                      key={module.id}
                      className="rounded-xl border border-slate-200/80 bg-slate-50/40 overflow-hidden"
                    >
                      <div className="p-3 bg-slate-100/70 border-b border-slate-200/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          {module.title}
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          {moduleCompletedCount}/{module.lessons.length}
                        </span>
                      </div>

                      <div className="p-1 space-y-1">
                        {module.lessons.map((lesson) => {
                          const isSelected = lesson.id === currentLessonId;
                          const isDone = completedLessons.includes(lesson.id);

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => setCurrentLessonId(lesson.id)}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all text-left cursor-pointer border ${
                                isSelected
                                  ? "bg-purple-50 text-purple-900 border-purple-200 font-bold shadow-2xs"
                                  : isDone
                                  ? "bg-white/80 text-slate-700 border-slate-200/60 hover:bg-slate-50"
                                  : "bg-white/40 text-slate-600 border-slate-100 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                {isDone ? (
                                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 fill-emerald-50" />
                                ) : isSelected ? (
                                  <PlayCircle className="h-4 w-4 shrink-0 text-purple-600 fill-purple-100" />
                                ) : (
                                  <Circle className="h-4 w-4 shrink-0 text-slate-400" />
                                )}
                                <span className="truncate">{lesson.title}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
