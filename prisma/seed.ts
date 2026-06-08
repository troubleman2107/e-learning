import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const courses = [
    {
      id: "course_business_english",
      title: "Tiếng Anh giao tiếp công việc",
      description:
        "Luyện phản xạ hội thoại, email và thuyết trình cho môi trường văn phòng.",
      price: 699000,
      trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      downloadUrl:
        "https://cdn.vietlearn.example/secure/courses/business-english.zip",
    },
    {
      id: "course_data_analytics",
      title: "Data Analytics cho người mới",
      description:
        "Làm chủ spreadsheet, dashboard và tư duy dữ liệu qua bài tập thực tế.",
      price: 849000,
      trailerUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
      downloadUrl:
        "https://cdn.vietlearn.example/secure/courses/data-analytics.zip",
    },
  ];

  for (const course of courses) {
    await prisma.course.upsert({
      where: { id: course.id },
      update: course,
      create: course,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
