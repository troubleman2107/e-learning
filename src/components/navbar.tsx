"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LogIn,
  LogOut,
  BookOpen,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  Search,
  Loader2,
  Sparkles,
  Zap,
  Bot,
  Code2,
  TrendingUp,
  Dumbbell,
  Globe,
  ShoppingBag,
  Heart,
  HelpCircle,
  Info,
  BookMarked,
} from "lucide-react";

const categoriesMenu = [
  {
    name: "Lập Trình & Dev",
    slug: "lap-trinh",
    icon: Code2,
    desc: "Frontend, Backend, Fullstack & Mobile",
    color: "text-indigo-600 bg-indigo-50",
  },
  {
    name: "Ứng Dụng AI",
    slug: "ung-dung-ai",
    icon: Bot,
    desc: "ChatGPT, Midjourney, Automation & RAG",
    color: "text-purple-600 bg-purple-50",
  },
  {
    name: "Marketing Thực Chiến",
    slug: "kinh-doanh-marketing",
    icon: TrendingUp,
    desc: "Facebook Ads, TikTok Ads, SEO & Phễu Bán Hàng",
    color: "text-rose-600 bg-rose-50",
  },
  {
    name: "Thu Nhập Thụ Động",
    slug: "thu-nhap-thu-dong",
    icon: Zap,
    desc: "MMO, Affiliate, Dropshipping & Crypto",
    color: "text-amber-600 bg-amber-50",
  },
  {
    name: "Thể Hình & Sức Khỏe",
    slug: "the-hinh",
    icon: Dumbbell,
    desc: "Gym, Dinh dưỡng, Progressive Overload",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    name: "Ngoại Ngữ",
    slug: "ngoai-ngu",
    icon: Globe,
    desc: "Tiếng Anh giao tiếp, IELTS & TOEIC",
    color: "text-sky-600 bg-sky-50",
  },
];

const infoMenuItems = [
  { name: "Hướng Dẫn Mua Khóa Học", href: "/#benefits", icon: BookMarked },
  { name: "Giới Thiệu VietLearn", href: "/#benefits", icon: Info },
  {
    name: "Câu Hỏi Thường Gặp (FAQs)",
    href: "/#testimonials",
    icon: HelpCircle,
  },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLLIElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setCategoriesOpen(false);
      }
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setInfoOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      startTransition(() => {
        router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
        setMobileMenuOpen(false);
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white shadow-xs">
      {/* ══════════════════ ROW 1: BRAND LOGO + CATEGORY BUTTON + MAIN SEARCH BAR + ACTION BUTTONS ══════════════════ */}
      <div className="mx-auto flex h-16 max-w-[1536px] w-full items-center justify-between gap-3 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        {/* 1. Brand Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-md shadow-indigo-200 transition-all duration-300 group-hover:scale-105">
            <BookOpen className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent leading-none">
              VIETLEARN
            </span>
            <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5 hidden xl:inline">
              Nơi chia sẻ khóa học tiết kiệm chuẩn gốc
            </span>
          </div>
        </Link>

        {/* 2. "Danh Mục Khóa Học" Blue Button — Desktop only (lg+) */}
        <div className="relative hidden lg:block shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setCategoriesOpen(!categoriesOpen)}
            className="flex items-center gap-2 rounded-xl bg-[#356DF1] hover:bg-[#285be3] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            <Menu className="size-4 stroke-[2.5]" />
            <span>Danh Mục Khóa Học</span>
            <ChevronDown
              className={`size-4 transition-transform duration-200 ${
                categoriesOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Categories Dropdown Panel */}
          {categoriesOpen && (
            <div className="absolute left-0 top-full mt-2.5 w-[420px] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/15 backdrop-blur-xl animate-in fade-in-50 zoom-in-95 duration-150 z-50">
              <div className="mb-2 px-3 pt-1.5 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Tất cả danh mục
                </span>
                <Link
                  href="/courses"
                  onClick={() => setCategoriesOpen(false)}
                  className="text-xs font-semibold text-[#356DF1] hover:underline"
                >
                  Xem tất cả &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-1">
                {categoriesMenu.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/courses?category=${cat.slug}`}
                      onClick={() => setCategoriesOpen(false)}
                      className="group flex items-start gap-3 rounded-xl p-2.5 transition-all hover:bg-blue-50/70"
                    >
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${cat.color} transition-transform group-hover:scale-105`}
                      >
                        <Icon className="size-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-[#356DF1]">
                          {cat.name}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {cat.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. Main Search Input Bar — Flexible across Tablets (sm+) & Desktop */}
        <form
          onSubmit={handleSearch}
          className="hidden sm:flex flex-1 max-w-2xl mx-2 lg:mx-4 items-center relative"
        >
          <div className="relative flex w-full items-center">
            {isPending ? (
              <Loader2 className="absolute left-3.5 size-4.5 text-indigo-600 animate-spin pointer-events-none" />
            ) : (
              <Search className="absolute left-3.5 size-4.5 text-slate-400 pointer-events-none" />
            )}
            <input
              type="text"
              placeholder="Tìm khóa học, tài khoản, combo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200/90 bg-slate-100/90 py-2 pl-9 pr-9 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-[#356DF1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </form>

        {/* 4. Action Right Section: Yêu thích, Giỏ hàng, Đăng nhập */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 shrink-0">
          {/* Wishlist Link — Desktop (lg+) */}
          <Link
            href="/courses"
            className="hidden lg:flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#356DF1] transition-colors group"
          >
            <Heart className="size-4.5 text-slate-600 group-hover:text-[#356DF1] group-hover:scale-110 transition-transform" />
            <span>Yêu thích</span>
          </Link>

          {/* Cart Link — Desktop (lg+) */}
          <Link
            href="/dashboard"
            className="hidden lg:flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#356DF1] transition-colors group"
          >
            <ShoppingBag className="size-4.5 text-slate-600 group-hover:text-[#356DF1] group-hover:scale-110 transition-transform" />
            <span>Giỏ hàng</span>
          </Link>

          {/* Auth Button */}
          {status === "unauthenticated" && (
            <button
              onClick={() => signIn("google")}
              className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-slate-200 bg-white px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs hover:border-blue-300 hover:bg-blue-50/50 hover:text-[#356DF1] transition-all shrink-0"
            >
              <LogIn className="size-4 stroke-[2.5]" />
              <span className="hidden xs:inline">Đăng Nhập</span>
            </button>
          )}

          {status === "authenticated" && session?.user && (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3 shadow-xs hover:border-blue-200 hover:bg-blue-50/50 transition-all"
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "Avatar"}
                    width={28}
                    height={28}
                    className="rounded-full ring-2 ring-white"
                  />
                ) : (
                  <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                    {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate hidden sm:inline">
                  {session.user.name}
                </span>
              </Link>

              <button
                onClick={() => signOut()}
                className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          )}

          {/* Hamburger Menu Toggle — Available on Tablet & Mobile (< lg) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* ══════════════════ ROW 2: CENTERED SECONDARY NAVIGATION LINKS (khoahocre.com style - lg+ only) ══════════════════ */}
      <div className="hidden lg:block border-t border-slate-100 bg-white">
        <div className="mx-auto flex h-11 max-w-[1536px] w-full items-center justify-center px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          <ul className="flex items-center gap-6 lg:gap-8 text-xs sm:text-sm font-bold text-slate-700">
            <li>
              <Link
                href="/"
                className="text-[#356DF1] font-extrabold hover:underline transition-colors"
              >
                Trang Chủ
              </Link>
            </li>
            <li>
              <Link
                href="/courses"
                className="hover:text-[#356DF1] transition-colors"
              >
                Shop Khóa Học Rẻ
              </Link>
            </li>
            <li>
              <Link
                href="/courses?filter=free"
                className="hover:text-[#356DF1] transition-colors flex items-center gap-1"
              >
                <span>Khóa Học Free</span>
              </Link>
            </li>
            <li>
              <Link
                href="/courses?filter=combo"
                className="hover:text-[#356DF1] transition-colors"
              >
                Combo Tiết Kiệm
              </Link>
            </li>
            <li>
              <Link
                href="/courses"
                className="hover:text-[#356DF1] transition-colors"
              >
                Gói Hội Viên
              </Link>
            </li>
            <li>
              <Link
                href="/courses"
                className="hover:text-[#356DF1] transition-colors"
              >
                Shop Tài Khoản
              </Link>
            </li>

            {/* Thông Tin Dropdown */}
            <li className="relative" ref={infoRef}>
              <button
                onClick={() => setInfoOpen(!infoOpen)}
                className="flex items-center gap-1 hover:text-[#356DF1] transition-colors cursor-pointer"
              >
                <span>Thông Tin</span>
                <ChevronDown
                  className={`size-3.5 transition-transform duration-200 ${
                    infoOpen ? "rotate-180 text-[#356DF1]" : ""
                  }`}
                />
              </button>

              {infoOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl backdrop-blur-xl animate-in fade-in-50 zoom-in-95 duration-150 z-50">
                  {infoMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setInfoOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg p-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#356DF1] transition-all"
                      >
                        <Icon className="size-4 text-slate-400" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>

      {/* ══════════════════ MOBILE DRAWER MENU ══════════════════ */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden animate-in slide-in-from-top-2 duration-200">
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Tìm khóa học, tài khoản, combo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3.5 pr-9 text-xs text-slate-800 placeholder-slate-400 focus:border-[#356DF1] focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-3 top-2.5 text-slate-400 hover:text-[#356DF1]"
              >
                <Search className="size-4" />
              </button>
            </form>

            {/* Mobile Nav Links */}
            <div className="space-y-1 pt-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100"
              >
                <BookOpen className="size-4 text-[#356DF1]" />
                Trang Chủ
              </Link>

              <div className="py-1">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Danh Mục Khóa Học
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {categoriesMenu.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Link
                        key={cat.slug}
                        href={`/courses?category=${cat.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#356DF1]"
                      >
                        <Icon className="size-3.5 text-[#356DF1] shrink-0" />
                        <span className="truncate">{cat.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <Link
                href="/courses"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100"
              >
                <ShoppingBag className="size-4 text-emerald-600" />
                Shop Khóa Học Rẻ
              </Link>

              <Link
                href="/courses?filter=free"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100"
              >
                <Sparkles className="size-4 text-amber-500" />
                Khóa Học Free
              </Link>

              <Link
                href="/courses?filter=combo"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100"
              >
                <Zap className="size-4 text-purple-600" />
                Combo Tiết Kiệm
              </Link>

              {status === "authenticated" && (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100"
                >
                  <LayoutDashboard className="size-4 text-[#356DF1]" />
                  Dashboard
                </Link>
              )}
            </div>

            {/* Mobile Auth Button */}
            <div className="border-t border-slate-100 pt-3">
              {status === "authenticated" ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100"
                >
                  <LogOut className="size-4" />
                  Đăng Xuất
                </button>
              ) : (
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signIn("google");
                  }}
                  className="w-full rounded-xl bg-[#356DF1] py-2.5 text-xs font-bold text-white shadow-md"
                >
                  <LogIn className="size-4 mr-1.5" />
                  Đăng Nhập / Đăng Ký
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
