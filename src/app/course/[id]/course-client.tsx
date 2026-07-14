"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Lock,
  Play,
  Check,
  Star,
  Clock,
  BookOpen,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckoutModal } from "@/components/checkout-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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

const getLessonDuration = (lessonId: string) => {
  let hash = 0;
  for (let i = 0; i < lessonId.length; i++) {
    hash = lessonId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const mins = Math.abs(hash % 15) + 3; // 3 to 17 mins
  return mins;
};

const getModuleDurationStr = (lessons: any[]) => {
  const totalMins = lessons.reduce((sum, l) => sum + getLessonDuration(l.id), 0);
  if (totalMins >= 60) {
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }
  return `${totalMins}min`;
};

const getCourseDurationStr = (modules: any[]) => {
  const allLessons = modules.flatMap((m) => m.lessons);
  const totalMins = allLessons.reduce((sum, l) => sum + getLessonDuration(l.id), 0);
  if (totalMins >= 60) {
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }
  return `${totalMins}min`;
};

const getLearningPoints = (categorySlug: string, title: string) => {
  const t = title.toLowerCase();
  if (categorySlug === "ung-dung-ai" || t.includes("ai") || t.includes("chatgpt")) {
    return [
      "Làm chủ các công cụ AI hàng đầu hiện nay như ChatGPT, Midjourney, Claude",
      "Tự động hóa quy trình công việc hàng ngày, tiết kiệm 50% thời gian",
      "Thiết kế prompt tối ưu để giải quyết các bài toán kinh doanh thực tế",
      "Xây dựng chatbot và tích hợp AI vào quy trình làm việc của doanh nghiệp",
      "Ứng dụng AI để sáng tạo nội dung, hình ảnh và video chất lượng cao",
      "Nhận chứng chỉ hoàn thành và tham gia cộng đồng AI thực chiến"
    ];
  }
  if (categorySlug === "kinh-doanh-marketing" || t.includes("marketing") || t.includes("bán hàng") || t.includes("affiliate")) {
    return [
      "Xây dựng chiến lược Marketing đa kênh bền vững và tối ưu chi phí",
      "Làm chủ các công cụ quảng cáo Facebook Ads, Google Ads thế hệ mới",
      "Tự viết Content Marketing thu hút hàng triệu lượt xem và chuyển đổi",
      "Thiết lập và vận hành shop bán hàng trên TikTok Shop, Shopee hiệu quả",
      "Xây dựng phễu bán hàng tự động và tối ưu tỷ lệ chuyển đổi khách hàng",
      "Đọc hiểu số liệu báo cáo quảng cáo và ra quyết định tối ưu ngân sách"
    ];
  }
  if (categorySlug === "the-hinh" || t.includes("tập") || t.includes("gym")) {
    return [
      "Hiểu rõ nguyên lý vận động và kỹ thuật tập luyện chuẩn y khoa",
      "Thiết kế giáo án tập luyện cá nhân hóa theo từng mục tiêu",
      "Lập kế hoạch dinh dưỡng khoa học (Macro, Calories) dễ áp dụng",
      "Tránh các chấn thương thường gặp trong quá trình tập luyện",
      "Kỹ thuật kiểm soát nhịp thở và kết nối cơ bắp thần kinh (Mind-Muscle Connection)",
      "Được hỗ trợ trực tiếp từ huấn luyện viên chuyên nghiệp"
    ];
  }
  return [
    "Xây dựng mô hình kinh doanh tinh gọn 1 người (Solopreneur)",
    "Tạo nguồn thu nhập thụ động bền vững từ Affiliate và Digital Products",
    "Làm chủ kỹ năng sáng tạo nội dung số thu hút khách hàng tiềm năng",
    "Setup hệ thống tự động hóa vận hành, quản lý đơn hàng trơn tru",
    "Tìm kiếm sản phẩm winning và đàm phán nguồn hàng giá tốt nhất",
    "Tư duy tài chính cá nhân và chiến lược tái đầu tư tăng trưởng"
  ];
};

const getAuthorInfo = (categorySlug: string) => {
  if (categorySlug === "ung-dung-ai") {
    return {
      name: "Dr. Hoàng Minh",
      title: "AI Specialist & Researcher",
      rating: "4.9",
      avatar: "HM",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      bio: "Tiến sĩ Khoa học Máy tính chuyên ngành Trí tuệ Nhân tạo. Anh có hơn 10 năm kinh nghiệm nghiên cứu và phát triển các hệ thống AI tại Singapore và Việt Nam. Hiện tại anh là cố vấn công nghệ cho nhiều start-up công nghệ lớn.",
      details: "Hoàng Minh là một trong những chuyên gia đi đầu trong việc phổ cập ứng dụng AI vào công việc hàng ngày tại Việt Nam. Các khóa học của anh luôn hướng đến tính ứng dụng cao, giúp học viên giải quyết trực tiếp các bài toán thực tế mà không cần kiến thức code chuyên sâu."
    };
  }
  if (categorySlug === "kinh-doanh-marketing") {
    return {
      name: "Nguyễn Duy Linh",
      title: "Marketing Director @ Retail Chain",
      rating: "4.8",
      avatar: "DL",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      bio: "Chuyên gia Marketing với 12 năm thực chiến tại các tập đoàn bán lẻ lớn tại Việt Nam. Anh từng trực tiếp tối ưu ngân sách quảng cáo hàng triệu USD và xây dựng hệ thống bán hàng đa kênh hiệu suất cao.",
      details: "Nguyễn Duy Linh nổi tiếng với phong cách giảng dạy trực diện, lấy số liệu làm thước đo hiệu quả. Anh tập trung hướng dẫn học viên các bước thực hiện chi tiết (step-by-step) để đạt được mục tiêu doanh số nhanh nhất."
    };
  }
  if (categorySlug === "the-hinh") {
    return {
      name: "Coach Lê Nam",
      title: "Expert Fitness Coach & Nutritionist",
      rating: "4.9",
      avatar: "LN",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      bio: "Huấn luyện viên thể hình cá nhân được chứng nhận quốc tế (NASM-CPT) với hơn 8 năm kinh nghiệm thay đổi vóc dáng cho hàng nghìn học viên. Anh cũng là một Content Creator nổi tiếng trong lĩnh vực sức khỏe.",
      details: "Lê Nam tin vào phương pháp tập luyện và dinh dưỡng dựa trên khoa học (Evidence-Based). Khóa học của anh không chỉ hướng dẫn động tác mà còn giúp học viên hiểu rõ nguyên lý hoạt động của cơ thể để tự làm chủ lộ trình tập luyện của mình."
    };
  }
  return {
    name: "Trần Minh Nam",
    title: "Full-Stack Engineer & Solopreneur",
    rating: "4.9",
    avatar: "MN",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    bio: "Kỹ sư phần mềm và nhà sáng lập doanh nghiệp 1 người. Anh đã xây dựng thành công 3 sản phẩm SaaS có doanh thu ổn định và có nhiều năm kinh nghiệm tự do tài chính, làm việc từ xa.",
    details: "Trần Minh Nam hướng dẫn học viên cách tận dụng công nghệ để giải phóng sức lao động, tự xây dựng hệ thống kinh doanh tự động hóa. Anh chú trọng chia sẻ các case-study thực tế từ chính hành trình xây dựng sự nghiệp của mình."
  };
};

export function CourseClient({
  course,
  hasPurchased,
  initialCompletedLessons = [],
  userEmail = "",
}: {
  course: any;
  hasPurchased: boolean;
  initialCompletedLessons?: string[];
  userEmail?: string;
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

  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{
    orderCode: number;
    amount: number;
    courseTitle: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedLockedLesson, setSelectedLockedLesson] = useState<any>(null);

  const initiateCheckout = async (email: string) => {
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: course.id, email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra");
      }

      // Open the checkout modal with order details
      setCheckoutData({
        orderCode: data.orderCode,
        amount: data.amount,
        courseTitle: data.courseTitle,
      });
      setIsModalOpen(true);
    } catch (error: any) {
      toast.error(error.message || "Không thể khởi tạo thanh toán");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleEnroll = async () => {
    if (status === "unauthenticated" || !session?.user) {
      // Not logged in -> Sign in with Google and redirect back to this page with action=checkout
      const callbackUrl = `${window.location.origin}/course/${course.id}?action=checkout`;
      await signIn("google", { callbackUrl });
      return;
    }

    // Logged in -> initiate checkout
    const email = session?.user?.email || userEmail;
    if (email) {
      await initiateCheckout(email);
    } else {
      toast.error("Không tìm thấy email của bạn. Vui lòng đăng nhập lại.");
    }
  };

  // Handle auto-checkout when redirected back from Google OAuth
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "checkout" && status === "authenticated" && session?.user?.email) {
      // Clean up the URL parameter first to prevent repeated triggers on reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
      
      initiateCheckout(session.user.email);
    }
  }, [status, session, searchParams]);

  // Deterministic stats
  const reviewCount = (course.title.length * 3 + 12) % 150 + 15;
  const authorInfo = getAuthorInfo(course.category?.slug || "");

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
      setSelectedLockedLesson(lesson);
      setIsUpgradeModalOpen(true);
      return;
    }
    setCurrentLessonId(lesson.id);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép liên kết khóa học vào bộ nhớ tạm!");
    }
  };

  return (
    <>
    <section className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/courses" className="hover:text-indigo-600 transition-colors font-medium">
          Courses
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-400" />
        {course.category ? (
          <>
            <Link 
              href={`/courses?category=${course.category.slug}`} 
              className="hover:text-indigo-600 transition-colors font-medium"
            >
              {course.category.name}
            </Link>
            <ChevronRight className="h-3 w-3 text-gray-400" />
          </>
        ) : (
          <>
            <span className="text-gray-400">Tất cả</span>
            <ChevronRight className="h-3 w-3 text-gray-400" />
          </>
        )}
        <span className="text-gray-900 font-semibold truncate max-w-[200px] sm:max-w-none">
          {course.title}
        </span>
      </div>

      {/* Header Info Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8 border-b border-gray-100 pb-6">
        <div className="flex items-start gap-4">
          <Link 
            href="/courses" 
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 shadow-xs hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl tracking-tight leading-tight">
                {course.title}
              </h1>
              {course.category && (
                <span className="rounded-full border border-gray-200 bg-gray-50/80 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                  {course.category.name}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs md:text-sm text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-gray-400" />
                {allLessons.length} bài học
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-gray-400" />
                {getCourseDurationStr(course.modules)}
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                4.8 ({reviewCount} đánh giá)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        {/* Left Column (Video & Content Details) */}
        <div className="space-y-8">
          {/* Video Player */}
          <div className="overflow-hidden rounded-2xl border border-gray-200/60 bg-black shadow-md">
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
                <div className="flex h-full items-center justify-center text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                  <span className="ml-3 text-sm">Đang tải video...</span>
                </div>
              )}
            </div>
          </div>

          {/* Details Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-8 flex w-full justify-start gap-2 md:gap-3 bg-transparent p-0 overflow-x-auto scrollbar-none border-0">
              {["overview", "author", "faq", "announcements", "reviews"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="relative rounded-full px-5 py-2 text-xs md:text-sm font-bold text-gray-500 transition-all duration-200 hover:text-gray-900 cursor-pointer border-0 shadow-none data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none data-[state=active]:border-0 data-[state=active]:border-transparent bg-transparent outline-none focus:outline-none"
                >
                  {tab === "overview" && "Overview"}
                  {tab === "author" && "Author"}
                  {tab === "faq" && "FAQ"}
                  {tab === "announcements" && "Announcements"}
                  {tab === "reviews" && "Reviews"}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0 space-y-6 outline-none">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-xs">
                <h3 className="text-lg font-bold text-gray-900 mb-3">About Course</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                  {course.description}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-xs">
                <h3 className="text-lg font-bold text-gray-900 mb-5">What You'll Learn</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {getLearningPoints(course.category?.slug || "", course.title).map((point, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                      <span className="text-xs md:text-sm text-gray-600 leading-tight">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Author Tab */}
            <TabsContent value="author" className="mt-0 outline-none">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                  <img 
                    src={authorInfo.image} 
                    alt={authorInfo.name} 
                    className="h-16 w-16 rounded-full object-cover ring-4 ring-slate-50 shadow-xs"
                  />
                  <div>
                    <h4 className="text-base font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-1.5">
                      {authorInfo.name}
                      <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-500 text-white text-[8px] font-bold">✓</span>
                    </h4>
                    <p className="text-xs text-gray-500 font-semibold mt-0.5">{authorInfo.title}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-1 mt-1 text-xs font-bold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      <span>{authorInfo.rating} Rating</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-5 space-y-3">
                  <p className="text-gray-600 leading-relaxed text-xs md:text-sm">{authorInfo.bio}</p>
                  <p className="text-gray-600 leading-relaxed text-xs md:text-sm">{authorInfo.details}</p>
                </div>
              </div>
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="mt-0 outline-none">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-xs">
                <h3 className="text-lg font-bold text-gray-900 mb-5">Frequently Asked Questions</h3>
                <Accordion type="single" collapsible className="w-full space-y-3">
                  {[
                    {
                      q: "Khóa học này có thời hạn bao lâu?",
                      a: "Bạn sẽ có quyền truy cập trọn đời vào toàn bộ video bài giảng và tài nguyên cập nhật mới nhất của khóa học này."
                    },
                    {
                      q: "Làm thế nào để nhận hỗ trợ khi gặp khó khăn?",
                      a: "Bạn sẽ được tham gia nhóm Discord/Zalo kín dành riêng cho học viên. Giảng viên và đội ngũ hỗ trợ sẽ giải đáp thắc mắc của bạn trong vòng 24 giờ."
                    },
                    {
                      q: "Tôi có được hoàn tiền không nếu thấy không phù hợp?",
                      a: "VietLearn cam kết hoàn tiền 100% trong vòng 7 ngày đầu tiên nếu bạn học chưa quá 20% thời lượng và cảm thấy khóa học không mang lại giá trị như mong muốn."
                    }
                  ].map((item, index) => (
                    <AccordionItem key={index} value={`faq-${index}`} className="rounded-xl border border-gray-100 px-4 bg-gray-50/20">
                      <AccordionTrigger className="text-xs md:text-sm font-bold text-gray-900 hover:no-underline py-4">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 text-xs md:text-sm leading-relaxed pb-4 pt-1">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>

            {/* Announcements Tab */}
            <TabsContent value="announcements" className="mt-0 outline-none">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-xs space-y-6">
                <h3 className="text-lg font-bold text-gray-900">Announcements</h3>
                <div className="rounded-xl border border-indigo-50 bg-indigo-50/10 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={authorInfo.image} 
                      alt={authorInfo.name} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{authorInfo.name}</h4>
                      <p className="text-[10px] text-gray-400">Đăng 2 ngày trước • Thông báo chung</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                    Chào mừng bạn đến với khóa học! Khóa học đã chính thức được cập nhật phiên bản 2026 với các bài giảng mới nhất về ứng dụng thực tiễn. Hãy tham gia Discord học viên ở tab Tài nguyên để cùng trao đổi và nhận hỗ trợ từ Mentor nhé!
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-0 outline-none">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-xs space-y-6">
                <h3 className="text-lg font-bold text-gray-900">Student Reviews</h3>
                
                <div className="divide-y divide-gray-100">
                  {[
                    {
                      name: "Nguyễn Tuấn Anh",
                      avatar: "TA",
                      date: "1 tuần trước",
                      rating: 5,
                      content: "Khóa học cực kỳ chất lượng! Giảng viên dạy rất dễ hiểu, đi thẳng vào thực tế chứ không lý thuyết suông. Mình đã áp dụng ngay vào dự án của công ty."
                    },
                    {
                      name: "Lê Thị Mai",
                      avatar: "LM",
                      date: "2 tuần trước",
                      rating: 5,
                      content: "Rất đáng tiền. Tài nguyên đi kèm cực kỳ phong phú và chi tiết. Group hỗ trợ học viên hoạt động rất tích cực, hỏi gì cũng được giải đáp nhiệt tình."
                    },
                    {
                      name: "Trần Quốc Bảo",
                      avatar: "QB",
                      date: "1 tháng trước",
                      rating: 5,
                      content: "Lộ trình bài bản, chia nhỏ từng phần nên học không bị ngợp. Phù hợp cho cả những người bận rộn muốn học thêm kỹ năng mới."
                    }
                  ].map((review, index) => (
                    <div key={index} className="py-5 first:pt-0 last:pb-0 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
                            {review.avatar}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900">{review.name}</h4>
                            <p className="text-[10px] text-gray-400">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{review.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* About Course Card */}
          <Card className="mt-8 border border-slate-200/80 rounded-2xl bg-white shadow-none p-6 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-gray-900">About Course</h3>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {course.description}
            </div>
          </Card>

          {/* What You'll Learn Card */}
          {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
            <Card className="mt-6 border border-slate-200/80 rounded-2xl bg-white shadow-none p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-gray-900">What You'll Learn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.whatYouWillLearn.map((item: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 p-1 mt-0.5">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm text-gray-700 leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column (Sidebar: Accordion Content & Mini Author Card) */}
        <div className="space-y-6">
          {!hasPurchased && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-5 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-0.5">
                    Ưu đãi giới hạn chỉ
                  </p>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">
                    {formatVnd(course.price)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 line-through font-medium block">
                    {formatVnd(course.price * 2)}
                  </span>
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100 font-bold border-none text-[10px] mt-1 shrink-0">
                    Tiết kiệm 50%
                  </Badge>
                </div>
              </div>

              {/* Urgency Message / Micro-CTA */}
              <button
                onClick={handleEnroll}
                disabled={isCheckingOut || status === "loading"}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs md:text-sm transition-all shadow-sm shadow-rose-100 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="h-3.5 w-3.5" />
                Đăng ký ngay
              </button>
            </div>
          )}

          {/* Course Content Accordion Card */}
          <div className="rounded-2xl border border-gray-200/80 bg-white shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-gray-900 text-base">Course content</h3>
              <span className="text-[10px] text-gray-500 font-bold bg-white px-2 py-0.5 rounded-md border border-gray-200 shadow-2xs">
                {getCourseDurationStr(course.modules)}
              </span>
            </div>
            
            <Accordion
              type="multiple"
              defaultValue={course.modules.map((m: any) => m.id)}
              className="w-full divide-y divide-gray-100"
            >
              {course.modules.map((module: any, idx: number) => {
                const orderStr = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;
                return (
                  <AccordionItem
                    key={module.id}
                    value={module.id}
                    className="border-none px-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-4 cursor-pointer">
                      <div className="flex items-center justify-between w-full pr-2 text-left">
                        <span className="font-bold text-xs md:text-sm text-gray-800 leading-tight">
                          {orderStr}: {module.title}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold shrink-0 ml-3">
                          {getModuleDurationStr(module.lessons)}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3 pt-1">
                      <div className="flex flex-col gap-1">
                        {module.lessons.map((lesson: any) => {
                          const isLocked = !lesson.isFreePreview && !hasPurchased;
                          const isActive = currentLessonId === lesson.id;
                          const duration = getLessonDuration(lesson.id);

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => handleLessonClick(lesson)}
                              className={`group flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-all duration-200 cursor-pointer ${
                                isActive
                                  ? "bg-indigo-50 text-indigo-700 font-bold"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                              } ${
                                isLocked ? "opacity-80" : ""
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                {isLocked ? (
                                  <Lock className="h-3.5 w-3.5 shrink-0 text-gray-300 group-hover:text-gray-400" />
                                ) : (
                                  <Play className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-indigo-600 fill-indigo-600/10" : "text-gray-400 group-hover:text-gray-600"}`} />
                                )}
                                <span className="truncate">{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {completedLessons.includes(lesson.id) && (
                                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                                  </div>
                                )}
                                <span className="text-[9px] text-gray-400 font-semibold tabular-nums">
                                  {duration} min
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>

          {/* Mini Author Card */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs space-y-4">
            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Author</span>
            <div className="flex items-center gap-3">
              <img 
                src={authorInfo.image} 
                alt={authorInfo.name} 
                className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-50"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1">
                  {authorInfo.name}
                  <span className="inline-flex items-center justify-center h-3 w-3 rounded-full bg-blue-500 text-white text-[6px] font-bold">✓</span>
                </h4>
                <p className="text-[10px] text-gray-500 font-semibold truncate mt-0.5">{authorInfo.title}</p>
              </div>
              <div className="flex items-center gap-0.5 text-xs font-bold text-amber-500 shrink-0">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>{authorInfo.rating}</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3">
              {authorInfo.bio}
            </p>
          </div>
        </div>
      </div>
    </section>

      {/* Checkout Payment Modal */}
      {checkoutData && (
        <CheckoutModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onRetry={handleEnroll}
          orderCode={checkoutData.orderCode}
          amount={checkoutData.amount}
          courseTitle={checkoutData.courseTitle}
          courseId={course.id}
        />
      )}

      {/* Upgrade Content Dialog */}
      <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl bg-white border border-gray-100 shadow-xl p-6 text-center">
          <div className="flex flex-col items-center">
            {/* Lock Icon */}
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <Lock className="h-7 w-7" />
            </div>

            <DialogHeader className="space-y-2 mb-6">
              <DialogTitle className="text-xl font-bold text-gray-900 text-center">
                Mở khóa toàn bộ nội dung
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 leading-relaxed text-center">
                Bài học <strong className="text-gray-800 font-semibold">{selectedLockedLesson?.title}</strong> thuộc nội dung trả phí. Đăng ký khóa học ngay để truy cập trọn bộ tài liệu và video chất lượng cao.
              </DialogDescription>
            </DialogHeader>

            {/* CTA Button */}
            <Button
              onClick={() => {
                setIsUpgradeModalOpen(false);
                handleEnroll();
              }}
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-100 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              Đăng ký ngay với {formatVnd(course.price)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
