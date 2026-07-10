import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function main() {
  const categories = [
    { name: "Ads", slug: "ads" },
    { name: "SEO", slug: "seo" },
    { name: "AI - Claude - GPT", slug: "ai-claude-gpt" },
    { name: "Tiktok", slug: "tiktok" },
    { name: "Shopee", slug: "shopee" },
    { name: "Tiếng Anh", slug: "tieng-anh" },
    { name: "Tài Chính - Kế Toán", slug: "tai-chinh-ke-toan" },
    { name: "Phòng the", slug: "phong-the" },
    { name: "Edit Video", slug: "edit-video" },
    { name: "Phong Thủy", slug: "phong-thuy" },
    { name: "Khóa học khác", slug: "khoa-hoc-khac" },
    { name: "Lập trình - Web", slug: "lap-trinh-web" },
    { name: "Copywriting", slug: "copywriting" },
    { name: "Data Analysis", slug: "data-analysis" },
    { name: "Bất động sản", slug: "bat-dong-san" },
    { name: "Kiếm tiền online", slug: "kiem-tien-online" },
    { name: "Tin học văn phòng", slug: "tin-hoc-van-phong" },
    { name: "Crypto - Forex - Chứng khoán", slug: "crypto-forex-chung-khoan" },
    { name: "Đồ họa - Thiết kế", slug: "do-hoa-thiet-ke" },
    { name: "Kinh doanh - Marketing", slug: "kinh-doanh-marketing" },
    { name: "Tiếng Trung - Nhật - Hàn", slug: "tieng-trung-nhat-han" },
    { name: "Ôn Thi THPT", slug: "on-thi-thpt" },
  ];

  console.log("🌱 Seeding categories to database...");

  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: {
        name: cat.name,
        slug: cat.slug,
      },
    });
    console.log(`  ✅ Category: ${record.name} (${record.slug})`);
  }

  console.log("🎉 Seeded all categories successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
