import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-sepay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const secretKey = process.env.SEPAY_WEBHOOK_SECRET;

    if (!secretKey) {
      console.error("Missing SEPAY_WEBHOOK_SECRET in environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Verify HMAC-SHA256 checksum
    const hmac = crypto.createHmac("sha256", secretKey);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // If payment is successful
    if (payload.code === "00") {
      const content = payload.content || "";

      // Extract all potential 6-digit order codes from the transfer content
      // Since our orderCode is a 6-digit integer
      const matches = content.match(/\d{6}/g);

      if (matches) {
        const potentialCodes = matches.map((m: string) => parseInt(m, 10));

        const orders = await prisma.order.findMany({
          where: {
            orderCode: { in: potentialCodes },
            status: "PENDING",
          },
        });

        // Update matched pending orders to PAID
        for (const order of orders) {
          // Note: The schema uses 'PAID', not 'COMPLETED'
          await prisma.order.update({
            where: { id: order.id },
            data: { status: "PAID" },
          });
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Sepay webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
