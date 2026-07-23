import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { TopLoader } from "@/components/top-loader";
import { ScrollToTop } from "@/components/scroll-to-top";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VietLearn | Hệ Thống Đào Tạo Thực Chiến cho Người Việt",
  description:
    "Nắm vững AI, Cloud và kỹ năng trending với khóa học thiết kế riêng cho thị trường Việt Nam. Học từ chuyên gia, thực hành trên dự án thật.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`h-full scroll-smooth ${inter.className}`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col antialiased">
        <Providers>
          <Suspense fallback={null}>
            <TopLoader />
          </Suspense>
          <Navbar />
          {children}
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}

