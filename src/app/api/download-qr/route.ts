import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bank = searchParams.get("bank");
  const acc = searchParams.get("acc");
  const amount = searchParams.get("amount");
  const des = searchParams.get("des");
  const holder = searchParams.get("holder");

  if (!bank || !acc || !des) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Construct target QR URL
  const targetUrl = `https://vietqr.app/img?bank=${bank}&acc=${acc}&template=&showinfo=true&holder=${encodeURIComponent(holder || "")}&amount=${amount || ""}&des=${des}`;

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch QR from source");
    }

    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="vietlearn-qr-${des}.png"`,
      },
    });
  } catch (error: any) {
    console.error("Error proxying QR download:", error);
    return NextResponse.json({ error: "Failed to download QR code" }, { status: 500 });
  }
}
