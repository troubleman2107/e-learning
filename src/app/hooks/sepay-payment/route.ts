import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // Use arrayBuffer to ensure exact byte matching for HMAC
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const signature = req.headers.get("x-sepay-signature");
    const authHeader = req.headers.get("authorization");
    const secretKey = process.env.SEPAY_WEBHOOK_SECRET;

    if (secretKey) {
      let isValid = false;

      // Method 1: Check API Key (Authorization: Apikey <SECRET>)
      if (authHeader && authHeader.includes(secretKey)) {
        isValid = true;
      }

      // Method 2: Check HMAC-SHA256 (x-sepay-signature)
      if (!isValid && signature) {
        // SePay sometimes prefixes the signature with 'sha256='
        const receivedHash = signature.replace(/^sha256=/, "");
        
        const hmac = crypto.createHmac("sha256", secretKey);
        hmac.update(buffer);
        const expectedSignature = hmac.digest("hex");
        
        if (receivedHash === expectedSignature) {
          isValid = true;
        } else {
          console.error(`HMAC mismatch. Expected: ${expectedSignature}, Got: ${receivedHash}`);
        }
      }

      if (!isValid) {
        console.error("401 Unauthorized. Headers received:", Object.fromEntries(req.headers.entries()));
        return NextResponse.json({ error: "Unauthorized signature or API Key" }, { status: 401 });
      }
    } else {
      console.warn("SEPAY_WEBHOOK_SECRET is not set. Skipping verification (Not recommended for production).");
    }

    const payload = JSON.parse(buffer.toString("utf8"));

    // Process if payload has transfer content (webhook triggered means it's usually successful)
    if (payload && payload.content) {
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
