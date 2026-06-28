import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderCode = searchParams.get("orderCode");

    if (!orderCode) {
      return NextResponse.json({ error: "Missing orderCode" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderCode: parseInt(orderCode, 10) },
      select: { status: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ status: order.status });
  } catch (error) {
    console.error("Order status check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
