import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseId, email } = body;

    if (!courseId || !email) {
      return NextResponse.json(
        { error: "Missing courseId or email" },
        { status: 400 }
      );
    }

    // Get the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Upsert the user
    const name = email.split("@")[0];
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name,
      },
    });

    // Generate unique order code (integer)
    let orderCode = 0;
    let isUnique = false;
    while (!isUnique) {
      // Generate a 6-digit number
      orderCode = Math.floor(100000 + Math.random() * 900000);
      const existing = await prisma.order.findUnique({
        where: { orderCode },
      });
      if (!existing) isUnique = true;
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderCode,
        userId: user.id,
        courseId: course.id,
        amount: course.price,
        status: "PENDING",
      },
    });

    // Return the checkout url to the frontend
    const checkoutUrl = `/checkout/${order.orderCode}`;

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
