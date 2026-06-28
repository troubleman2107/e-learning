import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrderStatusChecker } from "@/components/order-status-checker";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ orderCode: string }>;
}) {
  const resolvedParams = await params;
  const orderCode = parseInt(resolvedParams.orderCode);

  if (isNaN(orderCode)) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { orderCode },
    include: { course: true },
  });

  if (!order) {
    notFound();
  }

  const bankAccount = "21071997666";
  const bank = "TPBank";
  const accountName = "NGUYEN%20THAI%20BAO";

  const qrUrl = `https://vietqr.app/img?bank=${bank}&acc=${bankAccount}&template=compact&showinfo=true&holder=${accountName}&amount=${order.amount}&des=${order.orderCode}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-600">
          Please scan the QR code below to pay for <br />
          <span className="font-semibold text-gray-900">{order.course.title}</span>
        </p>

        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            alt="Payment QR Code"
            className="w-full max-w-[300px] h-auto border rounded-lg"
          />
        </div>

        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm space-y-2 text-left">
          <p>
            <strong>Amount:</strong> {order.amount.toLocaleString("vi-VN")} VND
          </p>
          <p>
            <strong>Transfer Content:</strong> {order.orderCode}
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/dashboard">
              I have paid - Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
      <OrderStatusChecker orderCode={order.orderCode} />
    </div>
  );
}
