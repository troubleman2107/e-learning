import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookOpen, Users, ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();

  const [courseCount, userCount, orderCount, recentOrders] = await Promise.all([
    prisma.course.count(),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.findMany({
      take: 6,
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
      href: "/admin/courses",
    },
    {
      label: "Người dùng",
      value: userCount,
      icon: Users,
      color: "text-emerald-600 bg-emerald-50",
      href: "/admin/users",
    },
    {
      label: "Đơn hàng",
      value: orderCount,
      icon: ShoppingCart,
      color: "text-amber-600 bg-amber-50",
      href: "/admin/orders",
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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.color} transition-transform group-hover:scale-105`}>
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
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-gray-200/60 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Đơn hàng gần đây</h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            <span>Xem tất cả ({orderCount})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[600px] text-left text-sm">
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
