"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Users, Tags, GraduationCap, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  {
    label: "Tổng quan",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Quản lý Khóa học",
    shortLabel: "Khóa học",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    label: "Quản lý Giảng viên",
    shortLabel: "Giảng viên",
    href: "/admin/authors",
    icon: GraduationCap,
  },
  {
    label: "Quản lý Danh mục",
    shortLabel: "Danh mục",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    label: "Quản lý Người dùng",
    shortLabel: "Users",
    href: "/admin/users",
    icon: Users,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-gray-200/60 bg-gray-50/50 md:block">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-200/60 px-5 py-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Admin Panel
            </h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors",
                      isActive
                        ? "text-indigo-600"
                        : "text-gray-400 group-hover:text-gray-600"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="sticky top-16 z-30 flex items-center justify-between border-b border-gray-200/60 bg-white/95 backdrop-blur-lg px-4 py-3 md:hidden">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Admin Panel
        </h2>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100"
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 top-[8rem] z-30 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <div className="relative z-10 border-b border-gray-200 bg-white shadow-lg animate-in slide-in-from-top-2 duration-200">
            <nav className="space-y-1 p-3">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0",
                        isActive ? "text-indigo-600" : "text-gray-400"
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
