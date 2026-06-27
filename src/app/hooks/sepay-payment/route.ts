import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // Use arrayBuffer to ensure exact byte matching for HMAC (avoids UTF-8 string encoding issues)
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const signature = req.headers.get("x-sepay-signature");

    if (!signature) {
      console.error("401 - Missing x-sepay-signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const secretKey = process.env.SEPAY_WEBHOOK_SECRET;

    if (!secretKey) {
      console.error("500 - Missing SEPAY_WEBHOOK_SECRET in environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Verify HMAC-SHA256 checksum using exact bytes
    const hmac = crypto.createHmac("sha256", secretKey);
    hmac.update(buffer);
    const expectedSignature = hmac.digest("hex");

    if (signature !== expectedSignature) {
      console.error(`401 - Invalid signature. Expected: ${expectedSignature}, Received: ${signature}`);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(buffer.toString("utf8"));

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
