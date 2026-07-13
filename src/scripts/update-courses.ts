import dotenv from "dotenv";
dotenv.config();
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Starting database course updates...");

  // Fetch all courses
  const courses = await prisma.course.findMany();
  console.log(`Found ${courses.length} courses.`);

  for (const course of courses) {
    const dummyPoints = [
      "Hiểu rõ nền tảng kiến thức cốt lõi và phương pháp luận chuyên sâu",
      "Làm chủ các công cụ thực tế và ứng dụng trực tiếp vào công việc hàng ngày",
      "Nhận tài liệu và bài tập thực hành độc quyền đi kèm từng module học",
      "Được kết nối và hỗ trợ từ chuyên gia hướng dẫn trong suốt quá trình học",
    ];

    await prisma.course.update({
      where: { id: course.id },
      data: {
        whatYouWillLearn: dummyPoints,
      },
    });

    console.log(`Updated course: "${course.title}" with dummy whatYouWillLearn points.`);
  }

  console.log("Database update completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
