import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateBunnyToken } from "@/lib/bunny";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;

    // 1. Fetch lesson with parent module and course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const courseId = lesson.module.course.id;

    // 2. Authorization Logic
    if (!lesson.isFreePreview) {
      const session = await auth();

      // Check if logged in
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Check for valid order
      // Using "PAID" instead of "COMPLETED" as it matches our OrderStatus enum
      const order = await prisma.order.findFirst({
        where: {
          userId: session.user.id,
          courseId: courseId,
          status: "PAID",
        },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Forbidden: You have not purchased this course" },
          { status: 403 }
        );
      }
    }

    // 3. Generate token
    const url = generateBunnyToken(lesson.bunnyVideoId);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error generating lesson token:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
