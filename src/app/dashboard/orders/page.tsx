import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Receipt, Calendar, CreditCard, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function OrderHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  // Fetch all orders of the user
  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      course: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800">
          Lịch sử thanh toán
        </h1>
        <p className="mt-1 text-xs md:text-sm text-slate-500">
          Theo dõi và quản lý các giao dịch đăng ký khóa học của bạn.
        </p>
      </div>

      {/* Orders Table Card */}
      <Card className="border border-slate-200/50 bg-white shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 border border-slate-200/40">
              <Receipt className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-700">Chưa có giao dịch nào</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
              Lịch sử mua hàng của bạn trống rỗng. Hãy tham gia các khóa học chất lượng để bắt đầu tạo giao dịch!
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/70">
              <TableRow>
                <TableHead className="w-[120px] font-semibold text-slate-600 text-xs px-6 py-3.5">Mã Đơn</TableHead>
                <TableHead className="font-semibold text-slate-600 text-xs px-4 py-3.5">Khóa Học</TableHead>
                <TableHead className="font-semibold text-slate-600 text-xs px-4 py-3.5">Ngày Mua</TableHead>
                <TableHead className="font-semibold text-slate-600 text-xs px-4 py-3.5">Số Tiền</TableHead>
                <TableHead className="font-semibold text-slate-600 text-xs px-6 py-3.5 text-right">Trạng Thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const formattedDate = new Date(order.createdAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <TableRow key={order.id} className="hover:bg-slate-50/30 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-slate-700 px-6 py-4">
                      #{order.orderCode}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="max-w-[280px] md:max-w-md truncate font-medium text-slate-800 text-xs md:text-sm">
                        {order.course.title}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formattedDate}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800 text-xs md:text-sm px-4 py-4">
                      {order.amount.toLocaleString("vi-VN")}đ
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Badge
                        variant="secondary"
                        className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full border ${
                          order.status === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : order.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : order.status === "FAILED"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        {order.status === "PAID"
                          ? "Thành công"
                          : order.status === "PENDING"
                            ? "Chờ thanh toán"
                            : order.status === "FAILED"
                              ? "Thất bại"
                              : "Đã hủy"}
                      </Badge>
                      {order.status === "PENDING" && (
                        <div className="mt-1">
                          <Link
                            href={`/checkout/${order.orderCode}`}
                            className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-violet-600 hover:text-violet-700 hover:underline"
                          >
                            <span>Thanh toán ngay</span>
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
