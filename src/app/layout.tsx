import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VietLearn | E-learning thực chiến cho người Việt",
  description:
    "Khám phá các khóa học kỹ năng ngắn, thực tế và phù hợp cho người Việt đi làm.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full scroll-smooth">
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  );
}
