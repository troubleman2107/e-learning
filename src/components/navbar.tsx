"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LogIn,
  LogOut,
  BookOpen,
  LayoutDashboard,
  GraduationCap,
} from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/60 bg-white/80 backdrop-blur-lg">
      <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-200 transition-shadow group-hover:shadow-lg group-hover:shadow-indigo-300">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            VietLearn
          </span>
        </Link>

        {/* Center Nav Links */}
        {status === "authenticated" && (
          <div className="hidden sm:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            <Link
              href="/courses"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <GraduationCap className="h-4 w-4" />
              Khóa học
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </div>
        )}

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {status === "loading" && (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-100" />
          )}

          {status === "unauthenticated" && (
            <Button
              onClick={() => signIn("google")}
              variant="outline"
              className="gap-2 rounded-lg border-gray-300 px-4 font-medium text-gray-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md"
            >
              <LogIn className="h-4 w-4" />
              Đăng nhập Google
            </Button>
          )}

          {status === "authenticated" && session?.user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 rounded-full border border-gray-200 bg-gray-50/80 py-1.5 pl-1.5 pr-4 shadow-sm">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "Avatar"}
                    width={28}
                    height={28}
                    className="rounded-full ring-2 ring-white"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-bold text-white">
                    {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {session.user.name}
                </span>
              </div>

              <Button
                onClick={() => signOut()}
                variant="ghost"
                size="sm"
                className="gap-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
