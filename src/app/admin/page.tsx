import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookOpen, Users, ShoppingCart } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();

  const [courseCount, userCount, orderCount, recentOrders] = await Promise.all([
    prisma.course.count(),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true, course: true },
    }),
  ]);

  const stats = [
    {
      label: "Khóa học",
      value: courseCount,
      icon: BookOpen,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Người dùng",
      value: userCount,
      icon: Users,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Đơn hàng",
      value: orderCount,
      icon: ShoppingCart,
      color: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Tổng quan
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Xin chào, {session?.user?.name}. Đây là bảng điều khiển quản trị.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-gray-200/60 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Đơn hàng gần đây</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-3">Mã đơn</th>
                <th className="px-6 py-3">Người mua</th>
                <th className="px-6 py-3">Khóa học</th>
                <th className="px-6 py-3">Số tiền</th>
                <th className="px-6 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50">
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-gray-600">
                    {order.orderCode}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-700">
                    {order.user.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-700">
                    {order.course.title}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-700">
                    {order.amount.toLocaleString("vi-VN")}đ
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        order.status === "PAID"
                          ? "bg-emerald-50 text-emerald-700"
                          : order.status === "PENDING"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    Chưa có đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
