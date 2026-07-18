"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, BookOpen, Receipt, Settings, LogOut, GraduationCap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface DashboardSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
}

const navItems = [
  {
    label: "Bảng điều khiển",
    shortLabel: "Tổng quan",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Khóa học của tôi",
    shortLabel: "Khóa học",
    href: "/dashboard/courses",
    icon: BookOpen,
  },
  {
    label: "Lịch sử thanh toán",
    shortLabel: "Đơn hàng",
    href: "/dashboard/orders",
    icon: Receipt,
  },
  {
    label: "Cài đặt tài khoản",
    shortLabel: "Cài đặt",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-slate-100 bg-slate-50/50 backdrop-blur-lg md:block">
        <div className="flex h-full flex-col justify-between p-4">
          <div className="space-y-6">
            {/* Header section */}
            <div className="px-3 py-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-violet-600" />
                <span className="font-semibold text-slate-800 tracking-tight">Trang học viên</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Quản lý lộ trình & học tập</p>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-violet-50 text-violet-700 shadow-sm border-l-2 border-violet-600 pl-2.5"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0 transition-colors",
                          isActive
                            ? "text-violet-600"
                            : "text-slate-400 group-hover:text-slate-600"
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4 text-violet-500/70" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Card Area */}
          <div className="space-y-3">
            <Card className="border border-slate-200/50 bg-white/70 p-3.5 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "Avatar"}
                    width={36}
                    height={36}
                    className="rounded-full ring-2 ring-violet-100"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white shadow-sm">
                    {user.name?.charAt(0)?.toUpperCase() || "H"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </p>
                  <p className="truncate text-[10px] text-slate-500 leading-none mt-0.5">
                    {user.email}
                  </p>
                  <div className="mt-1.5">
                    <Badge variant="secondary" className="px-1.5 py-0 text-[9px] font-medium bg-violet-50 text-violet-700 hover:bg-violet-50 border border-violet-100/50">
                      Học viên
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            <Button
              onClick={() => signOut({ callbackUrl: "/" })}
              variant="ghost"
              className="w-full justify-start gap-3 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 py-2.5 h-auto text-sm"
            >
              <LogOut className="h-[18px] w-[18px]" />
              <span>Đăng xuất</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-lg md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around px-2 py-1.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-center transition-colors min-w-0",
                  isActive
                    ? "text-violet-600"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-violet-600")} />
                <span className={cn("text-[10px] font-medium leading-tight truncate", isActive && "font-bold")}>
                  {item.shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
