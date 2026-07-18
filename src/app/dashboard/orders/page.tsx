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

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      PAID: { label: "Thành công", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      PENDING: { label: "Chờ thanh toán", className: "bg-amber-50 text-amber-700 border-amber-200" },
      FAILED: { label: "Thất bại", className: "bg-red-50 text-red-700 border-red-200" },
    };
    const c = config[status] || { label: "Đã hủy", className: "bg-slate-50 text-slate-600 border-slate-200" };
    return c;
  };

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

      {orders.length === 0 ? (
        <Card className="border border-slate-200/50 bg-white shadow-sm">
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 border border-slate-200/40">
              <Receipt className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-700">Chưa có giao dịch nào</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
              Lịch sử mua hàng của bạn trống rỗng. Hãy tham gia các khóa học chất lượng để bắt đầu tạo giao dịch!
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Mobile Card Layout */}
          <div className="space-y-3 md:hidden">
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });
              const statusInfo = getStatusBadge(order.status);

              return (
                <Card key={order.id} className="border border-slate-200/50 bg-white shadow-sm overflow-hidden">
                  <div className="p-4 space-y-3">
                    {/* Top: Order code + Status */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-slate-700">
                        #{order.orderCode}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full border ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </Badge>
                    </div>

                    {/* Course title */}
                    <p className="text-sm font-medium text-slate-800 line-clamp-2">
                      {order.course.title}
                    </p>

                    {/* Bottom: Date + Amount */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formattedDate}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-800">
                        {order.amount.toLocaleString("vi-VN")}đ
                      </span>
                    </div>

                    {/* Pending action */}
                    {order.status === "PENDING" && (
                      <Link
                        href={`/checkout/${order.orderCode}`}
                        className="flex items-center justify-center gap-1 w-full rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-600 hover:bg-violet-100 transition-colors"
                      >
                        <span>Thanh toán ngay</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Desktop Table Layout */}
          <Card className="border border-slate-200/50 bg-white shadow-sm overflow-hidden hidden md:block">
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
                  const statusInfo = getStatusBadge(order.status);

                  return (
                    <TableRow key={order.id} className="hover:bg-slate-50/30 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-slate-700 px-6 py-4">
                        #{order.orderCode}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="max-w-md truncate font-medium text-slate-800 text-sm">
                          {order.course.title}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-800 text-sm px-4 py-4">
                        {order.amount.toLocaleString("vi-VN")}đ
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Badge
                          variant="secondary"
                          className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full border ${statusInfo.className}`}
                        >
                          {statusInfo.label}
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
          </Card>
        </>
      )}
    </div>
  );
}
