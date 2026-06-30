import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding database with Course, Module, and Lessons...");

  const course = await prisma.course.create({
    data: {
      title: "Mastering Next.js 14 & Prisma",
      description: "Learn how to build full-stack applications with the latest App Router.",
      price: 499000,
      trailerUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
      bunnyVideoId: "trailer_video_id_here",
      modules: {
        create: {
          title: "Module 1: Getting Started",
          order: 1,
          lessons: {
            create: [
              {
                title: "Lesson 1: Introduction to Next.js",
                bunnyVideoId: "your_free_preview_video_id",
                isFreePreview: true,
                order: 1,
              },
              {
                title: "Lesson 2: Setting up Prisma",
                bunnyVideoId: "your_locked_video_id_1",
                isFreePreview: false,
                order: 2,
              },
              {
                title: "Lesson 3: Auth.js Integration",
                bunnyVideoId: "your_locked_video_id_2",
                isFreePreview: false,
                order: 3,
              },
            ],
          },
        },
      },
    },
    include: {
      modules: {
        include: {
          lessons: true,
        },
      },
    },
  });

  console.log("Seeded successfully!");
  console.log("Created Course ID:", course.id);
  console.log(`Created ${course.modules.length} Module(s) and ${course.modules[0].lessons.length} Lesson(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
