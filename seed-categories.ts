import { prisma } from "./src/lib/prisma";

async function main() {
  const categories = [
    { name: "Kinh doanh online", slug: "kinh-doanh-online" },
    { name: "Ứng dụng AI", slug: "ung-dung-ai" },
    { name: "Thể hình", slug: "the-hinh" },
    { name: "Ngoại ngữ", slug: "ngoai-ngu" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
      },
    });
  }

  console.log("✅ Seeded categories successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
