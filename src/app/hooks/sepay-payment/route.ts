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

    // Process if payload has any content
    if (payload) {
      // Sometimes the transfer content is in 'description' instead of 'content'
      const transferMemo = (payload.content || "") + " " + (payload.description || "");
      console.log("SePay Webhook Received Memo:", transferMemo);

      // Extract ALL numbers from the transfer memo (just in case it's formatted weirdly)
      const matches = transferMemo.match(/\d+/g);
      console.log("Extracted potential order codes:", matches);

      if (matches) {
        // Filter out massive numbers (like bank reference IDs) that crash the Int32 database type
        // Our orderCodes are always 6 digits (100000 to 999999)
        const potentialCodes = matches
          .map((m: string) => parseInt(m, 10))
          .filter((code) => code >= 100000 && code <= 999999);

        console.log("Filtered valid 6-digit order codes:", potentialCodes);

        if (potentialCodes.length > 0) {
          const orders = await prisma.order.findMany({
            where: {
              orderCode: { in: potentialCodes },
              status: "PENDING",
            },
          });

          console.log("Matched PENDING orders in Database:", orders.map((o) => o.orderCode));

          // Update matched pending orders to PAID
          for (const order of orders) {
            await prisma.order.update({
              where: { id: order.id },
              data: { status: "PAID" },
            });
            console.log(`✅ Successfully updated order ${order.orderCode} to PAID!`);
          }
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Sepay webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
