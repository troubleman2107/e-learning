import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { lessonId } = body;

    if (!lessonId) {
      return new NextResponse("Lesson ID is required", { status: 400 });
    }

    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        isCompleted: true,
      },
      create: {
        userId,
        lessonId,
        isCompleted: true,
      },
    });

    return NextResponse.json({ success: true, message: "Progress updated successfully", progress });
  } catch (error: any) {
    console.error("[PROGRESS_POST]", error);
    return new NextResponse(`Internal Error: ${error?.message || error}`, { status: 500 });
  }
}
