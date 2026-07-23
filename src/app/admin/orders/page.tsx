import { prisma } from "@/lib/prisma";
import { OrdersTable, AdminOrder } from "./orders-table";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      course: {
        select: { id: true, title: true },
      },
    },
  });

  const serializedOrders: AdminOrder[] = orders.map((order) => ({
    id: order.id,
    orderCode: order.orderCode,
    amount: order.amount,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    user: {
      id: order.user.id,
      name: order.user.name,
      email: order.user.email,
    },
    course: {
      id: order.course.id,
      title: order.course.title,
    },
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Quản lý Đơn hàng
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Xem, tìm kiếm và quản lý tất cả đơn hàng trên hệ thống.
        </p>
      </div>

      <OrdersTable orders={serializedOrders} />
    </div>
  );
}
