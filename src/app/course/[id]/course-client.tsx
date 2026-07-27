"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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
  ChevronRight,
  Loader2,
  Heart,
  Users,
  MonitorPlay,
  FileText,
  Download,
  Award,
  Share2,
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFavorites } from "@/components/favorites-provider";
import { CheckoutModal } from "@/components/checkout-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

const getYouTubeVideoId = (url: string) => {
  if (!url) return "";
  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.replace("www.", "");
    const pathParts = parsedUrl.pathname.split("/").filter(Boolean);

    if (host === "youtu.be") {
      return pathParts[0] ?? "";
    }

    if (host.endsWith("youtube.com")) {
      if (parsedUrl.pathname === "/watch") {
        return parsedUrl.searchParams.get("v") ?? "";
      }

      if (pathParts[0] === "embed" || pathParts[0] === "shorts") {
        return pathParts[1] ?? "";
      }
    }
    return "";
  } catch {
    return "";
  }
};

const getCourseThumbnail = (course: any) => {
  if (course.thumbnailUrl && typeof course.thumbnailUrl === "string" && course.thumbnailUrl.trim() !== "") {
    return course.thumbnailUrl;
  }
  if (course.thumbnail && typeof course.thumbnail === "string" && course.thumbnail.trim() !== "") {
    return course.thumbnail;
  }

  const title = (course.title || "").toLowerCase();
  const categorySlug = (course.category?.slug || "").toLowerCase();

  if (
    categorySlug === "the-hinh" ||
    title.includes("calisthenics") ||
    title.includes("bodyweight") ||
    title.includes("gym") ||
    title.includes("tập") ||
    title.includes("thể hình") ||
    title.includes("dinh dưỡng")
  ) {
    return "/course-fitness.png";
  }

  if (
    categorySlug === "ung-dung-ai" ||
    title.includes("ai") ||
    title.includes("chatgpt") ||
    title.includes("sora") ||
    title.includes("claude")
  ) {
    if (title.includes("prompt")) return "/course-prompt.png";
    if (title.includes("midjourney") || title.includes("thiết kế")) return "/course-diffusion.png";
    return "/course-ai.png";
  }

  if (
    categorySlug === "kinh-doanh-marketing" ||
    title.includes("marketing") ||
    title.includes("facebook") ||
    title.includes("google") ||
    title.includes("tiktok")
  ) {
    return "/course-aws.png";
  }

  if (
    categorySlug === "thu-nhap-thu-dong" ||
    title.includes("affiliate") ||
    title.includes("solopreneur") ||
    title.includes("dropshipping")
  ) {
    return "/course-docker.png";
  }

  // Fallback to youtube thumbnail if valid custom video and not dummy rickroll
  const youtubeVideoId = getYouTubeVideoId(course.trailerUrl);
  if (youtubeVideoId && youtubeVideoId !== "dQw4w9WgXcQ") {
    return `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`;
  }

  return "/course-docker.png";
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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const thumbnailUrl = getCourseThumbnail(course);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{
    orderCode: number;
    amount: number;
    courseTitle: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedLockedLesson, setSelectedLockedLesson] = useState<any>(null);

  const handleOpenPreviewModal = (lessonId?: string) => {
    if (lessonId) {
      setCurrentLessonId(lessonId);
    } else if (!currentLessonId) {
      const freeLesson = allLessons.find((l: any) => l.isFreePreview);
      if (freeLesson) {
        setCurrentLessonId(freeLesson.id);
      } else if (firstLesson) {
        setCurrentLessonId(firstLesson.id);
      }
    }
    setIsPreviewModalOpen(true);
  };

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
      const callbackUrl = `${window.location.origin}/course/${course.id}?action=checkout`;
      await signIn("google", { callbackUrl });
      return;
    }

    const email = session?.user?.email || userEmail;
    if (email) {
      await initiateCheckout(email);
    } else {
      toast.error("Không tìm thấy email của bạn. Vui lòng đăng nhập lại.");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [course.id]);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "checkout" && status === "authenticated" && session?.user?.email) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
      initiateCheckout(session.user.email);
    }
  }, [status, session, searchParams]);

  const reviewCount = (course.title.length * 3 + 12) % 150 + 15;
  const studentCount = (course.title.length * 47 + 831) % 9000 + 1200;
  const authorInfo = course.author || getAuthorInfo(course.category?.slug || "");

  const [isLessonLoading, setIsLessonLoading] = useState(false);

  useEffect(() => {
    if (!currentLessonId) return;

    const lesson = allLessons.find((l: any) => l.id === currentLessonId);
    if (!lesson) return;

    if (!lesson.isFreePreview && !hasPurchased) {
      setIframeUrl(getYouTubeEmbedUrl(course.trailerUrl));
      setIsLessonLoading(false);
      return;
    }

    const fetchToken = async () => {
      setIsLessonLoading(true);
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
      } finally {
        setTimeout(() => setIsLessonLoading(false), 250);
      }
    };

    fetchToken();
  }, [currentLessonId, hasPurchased, course.trailerUrl]);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        
        if (data.context === "player.js") {
          console.log("[Player.js Event]:", data);
          
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
              console.log("[Player.js] Requested to listen to 'ended' event");
            }
          }

          if (data.event === "ended") {
            if (!currentLessonId) return;

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
        // Ignore parse errors
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [currentLessonId, allLessons, hasPurchased]);

  const handleLessonClick = (lesson: any) => {
    if (hasPurchased) {
      router.push(`/learn/${course.id}`);
      return;
    }
    if (!lesson.isFreePreview) {
      setSelectedLockedLesson(lesson);
      setIsUpgradeModalOpen(true);
      return;
    }
    handleOpenPreviewModal(lesson.id);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép liên kết khóa học vào bộ nhớ tạm!");
    }
  };

  const learningPoints = course.whatYouWillLearn && course.whatYouWillLearn.length > 0
    ? course.whatYouWillLearn
    : getLearningPoints(course.category?.slug || "", course.title);

  return (
    <>
      {/* ===== DARK HERO SECTION ===== */}
      <section className="bg-[#1c1d1f] text-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="lg:max-w-[60%]">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs text-purple-300/80 mb-4 flex-wrap">
              <Link href="/courses" className="hover:text-white transition-colors font-medium">
                Khóa học
              </Link>
              <ChevronRight className="h-3 w-3 text-gray-500" />
              {course.category ? (
                <>
                  <Link 
                    href={`/courses?category=${course.category.slug}`} 
                    className="hover:text-white transition-colors font-medium"
                  >
                    {course.category.name}
                  </Link>
                  <ChevronRight className="h-3 w-3 text-gray-500" />
                </>
              ) : (
                <>
                  <span className="text-gray-400">Tất cả</span>
                  <ChevronRight className="h-3 w-3 text-gray-500" />
                </>
              )}
              <span className="text-gray-400 truncate max-w-[200px] sm:max-w-none">
                {course.title}
              </span>
            </nav>

            {/* Course Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight mb-3">
              {course.title}
            </h1>

            {/* Course Subtitle */}
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-4 line-clamp-2">
              {course.description?.replace(/<[^>]*>/g, '').substring(0, 200) || "Khóa học chất lượng cao từ VietLearn"}
            </p>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {course.category && (
                <span className="rounded-sm bg-amber-200 text-amber-900 px-2 py-0.5 text-[11px] font-bold">
                  Bestseller
                </span>
              )}
              <span className="rounded-sm bg-amber-100 text-amber-800 px-2 py-0.5 text-[11px] font-bold">
                Đánh giá cao nhất
              </span>
            </div>

            {/* Rating & Stats */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm mb-3">
              <span className="text-amber-400 font-bold">4.8</span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < 5 ? "fill-amber-400 text-amber-400" : "text-gray-500"}`} />
                ))}
              </div>
              <Link href="#reviews" className="text-purple-300 hover:text-purple-200 underline underline-offset-2 text-xs">
                ({reviewCount.toLocaleString()} đánh giá)
              </Link>
              <span className="text-gray-400 text-xs">
                {studentCount.toLocaleString()} học viên
              </span>
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-2 text-sm mb-3">
              <span className="text-gray-400">Được giảng dạy bởi</span>
              {course.author?.id ? (
                <Link href={`/courses?authorId=${course.author.id}`} className="text-purple-300 hover:text-purple-200 underline underline-offset-2 font-medium">
                  {authorInfo.name}
                </Link>
              ) : (
                <span className="text-purple-300 font-medium">{authorInfo.name}</span>
              )}
            </div>

            {/* Meta Info Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {getCourseDurationStr(course.modules)} tổng thời lượng
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                {allLessons.length} bài học
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Tiếng Việt
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MAIN CONTENT: Two-Column Layout ===== */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ===== LEFT COLUMN ===== */}
          <div className="flex-1 min-w-0 space-y-8 order-2 lg:order-1">

            {/* ===== 1. What You'll Learn ===== */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Bạn sẽ học được gì</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {learningPoints.map((item: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-4 w-4 shrink-0 text-gray-700 mt-0.5" strokeWidth={2.5} />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== 2. This Course Includes ===== */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Khóa học này bao gồm:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <MonitorPlay className="h-4 w-4 shrink-0 text-gray-500" />
                  <span>{getCourseDurationStr(course.modules)} video theo yêu cầu</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <FileText className="h-4 w-4 shrink-0 text-gray-500" />
                  <span>{allLessons.length} bài học</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Download className="h-4 w-4 shrink-0 text-gray-500" />
                  <span>Tài nguyên có thể tải xuống</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Globe className="h-4 w-4 shrink-0 text-gray-500" />
                  <span>Truy cập trọn đời</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <MonitorPlay className="h-4 w-4 shrink-0 text-gray-500" />
                  <span>Xem trên mobile và TV</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Award className="h-4 w-4 shrink-0 text-gray-500" />
                  <span>Chứng chỉ hoàn thành</span>
                </div>
              </div>
            </div>

            {/* ===== 3. Course Content Accordion ===== */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <h2 className="text-xl font-bold text-gray-900">Nội dung khóa học</h2>
                <span className="text-xs text-gray-500 font-medium">
                  {course.modules.length} phần • {allLessons.length} bài học • {getCourseDurationStr(course.modules)} tổng thời lượng
                </span>
              </div>

              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <Accordion
                  type="multiple"
                  defaultValue={course.modules.map((m: any) => m.id)}
                  className="w-full"
                >
                  {course.modules.map((module: any, idx: number) => {
                    return (
                      <AccordionItem
                        key={module.id}
                        value={module.id}
                        className="border-b border-gray-200 last:border-b-0"
                      >
                        <AccordionTrigger className="hover:no-underline py-3.5 px-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between w-full pr-2 text-left">
                            <span className="font-bold text-sm text-gray-800">
                              {module.title}
                            </span>
                            <span className="text-xs text-gray-500 font-medium shrink-0 ml-3">
                              {module.lessons.length} bài • {getModuleDurationStr(module.lessons)}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-0 pt-0">
                          <div className="divide-y divide-gray-100">
                            {module.lessons.map((lesson: any) => {
                              const isLocked = !lesson.isFreePreview && !hasPurchased;
                              const isActive = currentLessonId === lesson.id;
                              const duration = getLessonDuration(lesson.id);

                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => handleLessonClick(lesson)}
                                  className={`group flex items-center justify-between w-full px-4 py-3 text-left text-sm transition-all duration-150 cursor-pointer ${
                                    isActive
                                      ? "bg-indigo-50/70 text-indigo-700"
                                      : "text-gray-700 hover:bg-gray-50"
                                  } ${
                                    isLocked ? "opacity-75" : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0 pr-3">
                                    {isLocked ? (
                                      <Lock className="h-4 w-4 shrink-0 text-gray-400" />
                                    ) : completedLessons.includes(lesson.id) ? (
                                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                                      </div>
                                    ) : (
                                      <Play className={`h-4 w-4 shrink-0 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
                                    )}
                                    <span className={`truncate ${isActive ? "font-semibold" : ""}`}>{lesson.title}</span>
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    {lesson.isFreePreview && !hasPurchased && (
                                      <span className="inline-flex items-center gap-1 text-xs text-purple-700 bg-purple-50 group-hover:bg-purple-100 font-semibold px-2.5 py-1 rounded-full border border-purple-200 transition-all shadow-2xs">
                                        <Play className="h-2.5 w-2.5 fill-purple-600 text-purple-600" />
                                        Xem thử
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-400 font-medium tabular-nums">
                                      {duration}:{String(Math.abs((duration * 7) % 60)).padStart(2, '0')}
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
            </div>

            {/* ===== 4. Requirements ===== */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Yêu cầu khóa học</h2>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-900 shrink-0" />
                  Không yêu cầu kinh nghiệm trước đó
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-900 shrink-0" />
                  Không cần phần mềm trả phí
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-900 shrink-0" />
                  Chỉ cần máy tính có kết nối Internet
                </li>
              </ul>
            </div>

            {/* ===== 5. Description ===== */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Mô tả chi tiết</h2>
              <div className="relative">
                <div 
                  className={`rich-content text-sm text-gray-700 leading-relaxed space-y-4 ${
                    !isDescriptionExpanded ? "max-h-[750px] overflow-hidden" : ""
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: `${course.description}
                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h3 className="text-base font-bold text-gray-900">1. Tổng quan khóa học & Lợi thế cạnh tranh</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Trong thế giới số chuyển động không ngừng, việc làm chủ kiến thức thực chiến chính là chìa khóa vàng giúp bạn nổi bật. Khóa học <strong>${course.title}</strong> được xây dựng bài bản theo chuẩn thực tiễn ngành, tối ưu hóa cho cả người mới bắt đầu lẫn người muốn nâng cao tay nghề.
                        </p>
                        
                        <h3 className="text-base font-bold text-gray-900">2. Phương pháp đào tạo thực chiến chuẩn quốc tế</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Khóa học áp dụng mô hình <em>Project-Based Learning (Học qua dự án thực tế)</em>. Bạn sẽ không chỉ nghe giảng lý thuyết mà còn trực tiếp bắt tay vào thực hành từng bước (step-by-step) trên các bài tập mẫu, giúp ghi nhớ lâu và tự tin ứng dụng ngay vào công việc thực tế.
                        </p>

                        <h3 className="text-base font-bold text-gray-900">3. Giá trị vượt trội & Đặc quyền học viên</h3>
                        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                          <li>Sở hữu quyền truy cập trọn đời toàn bộ bài giảng video chất lượng cao HD.</li>
                          <li>Tải xuống bộ tài nguyên, bài tập và mẫu Template đóng gói sẵn độc quyền.</li>
                          <li>Tham gia cộng đồng học viên kín để giao lưu, mở rộng mạng lưới và nhận hỗ trợ 24/7.</li>
                          <li>Cấp chứng chỉ hoàn thành uy tín sau khi hoàn thành toàn bộ lộ trình khóa học.</li>
                        </ul>

                        <h3 className="text-base font-bold text-gray-900">4. Cam kết chất lượng từ VietLearn</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          VietLearn luôn đặt chất lượng giảng dạy và trải nghiệm của học viên lên hàng đầu. Hỗ trợ chính sách hoàn tiền 100% trong 7 ngày đầu tiên nếu bạn không hài lòng. Hãy chủ động nắm bắt cơ hội để làm chủ kỹ năng mới ngay hôm nay!
                        </p>
                      </div>`
                  }}
                />
                {!isDescriptionExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent pointer-events-none" />
                )}
              </div>
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-3 flex items-center gap-1 text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors cursor-pointer"
              >
                {isDescriptionExpanded ? (
                  <>
                    Thu gọn <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Xem thêm <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            {/* ===== 6. Instructor ===== */}
            <div id="instructor">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Thông tin giảng viên</h2>
              {course.author?.id ? (
                <Link href={`/courses?authorId=${course.author.id}`} className="text-purple-600 hover:text-purple-700 text-base font-bold underline underline-offset-2 mb-4 inline-block">
                  {authorInfo.name}
                </Link>
              ) : (
                <p className="text-purple-600 text-base font-bold mb-4">{authorInfo.name}</p>
              )}
              <p className="text-xs text-gray-500 font-medium mb-4">{authorInfo.title}</p>

              <div className="flex items-center gap-4 mb-4">
                {course.author?.id ? (
                  <Link href={`/courses?authorId=${course.author.id}`} className="shrink-0 hover:opacity-90 transition-opacity">
                    <img 
                      src={authorInfo.image} 
                      alt={authorInfo.name} 
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  </Link>
                ) : (
                  <img 
                    src={authorInfo.image} 
                    alt={authorInfo.name} 
                    className="h-24 w-24 rounded-full object-cover"
                  />
                )}
                <div className="space-y-1.5 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-gray-500" />
                    <span>{authorInfo.rating} Đánh giá giảng viên</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{studentCount.toLocaleString()} học viên</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-gray-500" />
                    <span>{course.modules.length} khóa học</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>{authorInfo.bio}</p>
                <p>{authorInfo.details}</p>
              </div>
            </div>

            {/* ===== 7. Reviews ===== */}
            <div id="reviews">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Đánh giá từ học viên</h2>
              
              {/* Rating Summary */}
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-100">
                <div className="text-center">
                  <p className="text-5xl font-bold text-amber-700">4.8</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Đánh giá khóa học</p>
                </div>
                {/* Rating bars */}
                <div className="flex-1 space-y-1.5">
                  {[
                    { stars: 5, pct: 78 },
                    { stars: 4, pct: 15 },
                    { stars: 3, pct: 5 },
                    { stars: 2, pct: 1 },
                    { stars: 1, pct: 1 },
                  ].map((row) => (
                    <div key={row.stars} className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gray-700 rounded-full transition-all duration-500" 
                          style={{ width: `${row.pct}%` }} 
                        />
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0 w-16 justify-end">
                        {[...Array(row.stars)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{row.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Reviews */}
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-xs font-bold text-white">
                          {review.avatar}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{review.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex gap-0.5">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <span className="text-xs text-gray-400">{review.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{review.content}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ===== RIGHT COLUMN — STICKY SIDEBAR ===== */}
          <div className="w-full lg:w-[380px] shrink-0 order-1 lg:order-2">
            <div className="sticky top-24 space-y-0 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
              
              {/* Video Preview / Player */}
              <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
                <div
                  onClick={() => handleOpenPreviewModal()}
                  className="relative h-full w-full cursor-pointer group flex items-center justify-center"
                >
                  {thumbnailUrl ? (
                    <Image
                      src={thumbnailUrl}
                      alt={course.title}
                      width={800}
                      height={800}
                      quality={95}
                      priority
                      className="aspect-square h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 text-center font-bold text-sm">
                      {course.title}
                    </div>
                  )}

                  {/* Dark tint overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-center gap-2.5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-900 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white">
                      <Play className="h-6 w-6 fill-current ml-0.5" />
                    </div>
                    <span className="text-xs font-bold text-white tracking-wide drop-shadow-md">
                      Xem trước khóa học
                    </span>
                  </div>
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="p-5 space-y-4">
                {!hasPurchased ? (
                  <>
                    {/* Price */}
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-3xl font-extrabold text-gray-900">
                        {formatVnd(course.price)}
                      </span>
                      <span className="text-base text-gray-400 line-through">
                        {formatVnd(course.price * 2)}
                      </span>
                      <span className="text-sm font-bold text-gray-500">-50%</span>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={handleEnroll}
                      disabled={isCheckingOut || status === "loading"}
                      className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-75 text-white font-bold text-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isCheckingOut ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang khởi tạo thanh toán...
                        </>
                      ) : (
                        "Đăng ký ngay"
                      )}
                    </button>

                    {/* Guarantee */}
                    <p className="text-xs text-gray-500 text-center">
                      Hoàn tiền 100% trong 7 ngày
                    </p>
                    <p className="text-xs text-gray-500 text-center font-medium">
                      Truy cập trọn đời
                    </p>
                  </>
                ) : (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-sm mb-1">
                      <Check className="h-4 w-4" />
                      Đã đăng ký
                    </div>
                    <p className="text-xs text-emerald-600">Bạn có quyền truy cập đầy đủ khóa học này</p>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-gray-100 pt-3 space-y-3">
                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                    >
                      <Share2 className="h-4 w-4" />
                      Chia sẻ
                    </button>
                    <button
                      onClick={(e) => toggleFavorite(course, e)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                        isFavorite(course.id)
                          ? "text-rose-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isFavorite(course.id) ? "fill-rose-500 text-rose-500" : ""
                        }`}
                      />
                      {isFavorite(course.id) ? "Đã yêu thích" : "Yêu thích"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Mobile Sticky Bottom CTA */}
      {!hasPurchased && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-lg px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium">Giá khóa học</p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-gray-900">
                  {formatVnd(course.price)}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  {formatVnd(course.price * 2)}
                </span>
              </div>
            </div>
            <button
              onClick={handleEnroll}
              disabled={isCheckingOut || status === "loading"}
              className="shrink-0 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-75 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đăng ký ngay"
              )}
            </button>
          </div>
        </div>
      )}

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

            <Button
              onClick={() => {
                setIsUpgradeModalOpen(false);
                handleEnroll();
              }}
              className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-md shadow-purple-100 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              Đăng ký ngay với {formatVnd(course.price)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Video Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-4xl w-[95vw] sm:max-w-4xl p-0 overflow-hidden bg-slate-950 border-slate-800 text-white shadow-2xl rounded-2xl flex flex-col max-h-[88vh]">
          {/* Header */}
          <div className="bg-slate-900 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0 pr-4">
              <span className="bg-purple-500/20 text-purple-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-500/30 shrink-0">
                Xem trước
              </span>
              <h3 className="font-bold text-sm sm:text-base text-white truncate">
                {allLessons.find((l: any) => l.id === currentLessonId)?.title || course.title}
              </h3>
            </div>
          </div>

          {/* Modal Content Area (Scrollable body) */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Top: Widescreen 16:9 Video Container */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center shrink-0">
              {isLessonLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xs text-white">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-400 mb-2" />
                  <p className="text-xs font-semibold tracking-wide text-slate-200">
                    Đang tải bài học xem thử...
                  </p>
                </div>
              )}
              {iframeUrl ? (
                <iframe
                  ref={iframeRef}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-none"
                  src={iframeUrl.includes("?") ? `${iframeUrl}&autoplay=1` : `${iframeUrl}?autoplay=1`}
                  title={allLessons.find((l: any) => l.id === currentLessonId)?.title || course.title}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
                  <span className="text-xs font-medium">Đang tải video...</span>
                </div>
              )}
            </div>

            {/* Below Video: Course Lessons Section */}
            <div className="bg-slate-900 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-400" />
                  Nội dung bài giảng ({allLessons.length} bài)
                </h4>
                <span className="text-xs text-purple-300 font-semibold bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-800/50">
                  {allLessons.filter((l: any) => l.isFreePreview).length} bài học thử
                </span>
              </div>

              <div className="space-y-3">
                {course.modules.map((module: any) => (
                  <div key={module.id} className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 space-y-2">
                    <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>{module.title}</span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {module.lessons.length} bài
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                      {module.lessons.map((lesson: any) => {
                        const isSelected = lesson.id === currentLessonId;
                        const isFree = lesson.isFreePreview;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              if (isFree || hasPurchased) {
                                setCurrentLessonId(lesson.id);
                              } else {
                                setSelectedLockedLesson(lesson);
                                setIsUpgradeModalOpen(true);
                              }
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all text-left cursor-pointer border ${
                              isSelected
                                ? "bg-purple-600/20 text-purple-200 border-purple-500/50 font-semibold"
                                : isFree || hasPurchased
                                ? "bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
                                : "bg-slate-900/30 text-slate-500 border-slate-800/40 hover:bg-slate-900/60"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              {isFree || hasPurchased ? (
                                <Play className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-purple-400 fill-purple-400" : "text-slate-400"}`} />
                              ) : (
                                <Lock className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                              )}
                              <span className="truncate">{lesson.title}</span>
                            </div>
                            {isFree && !hasPurchased && (
                              <span className="text-[10px] text-purple-300 font-semibold shrink-0 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-800/80">
                                Xem thử
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Modal Footer CTA */}
          {!hasPurchased && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/95 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-white">
                    {formatVnd(course.price)}
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    {formatVnd(course.price * 2)}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 font-medium">Truy cập trọn đời • Hoàn tiền 100% 7 ngày</p>
              </div>

              <Button
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  handleEnroll();
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-purple-900/40 cursor-pointer"
              >
                Đăng ký ngay
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
