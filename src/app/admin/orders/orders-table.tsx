"use client";

import { useState, useTransition } from "react";
import { Search, Filter, CheckCircle2, Clock, XCircle, AlertCircle, ShoppingBag, Loader2 } from "lucide-react";
import { updateOrderStatus } from "./actions";
import { OrderStatus } from "@/generated/prisma/client";
import { toast } from "sonner";

export type AdminOrder = {
  id: string;
  orderCode: number;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  course: {
    id: string;
    title: string;
  };
};

interface OrdersTableProps {
  orders: AdminOrder[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderCode.toString().includes(search) ||
      order.user.email.toLowerCase().includes(search.toLowerCase()) ||
      (order.user.name && order.user.name.toLowerCase().includes(search.toLowerCase())) ||
      order.course.title.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, newStatus);
        toast.success(`Đã cập nhật đơn hàng thành ${newStatus}!`);
      } catch (error) {
        console.error("Failed to update status:", error);
        toast.error("Không thể cập nhật trạng thái đơn hàng.");
      } finally {
        setUpdatingId(null);
      }
    });
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            PAID
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            PENDING
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600 border border-gray-200">
            <XCircle className="h-3.5 w-3.5 text-gray-400" />
            CANCELLED
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
            <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
            FAILED
          </span>
        );
    }
  };

  // Stats calculations
  const totalAmount = orders.reduce((sum, o) => sum + (o.status === "PAID" ? o.amount : 0), 0);
  const paidCount = orders.filter((o) => o.status === "PAID").length;
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div className="space-y-6">
      {/* Top Quick Summary Badges */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200/60 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-gray-500">Tổng Đơn Hàng</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{orders.length} đơn</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs">
          <p className="text-xs font-medium text-emerald-700">Đã Thanh Toán ({paidCount})</p>
          <p className="mt-1 text-xl font-bold text-emerald-900">
            {totalAmount.toLocaleString("vi-VN")}đ
          </p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 shadow-xs">
          <p className="text-xs font-medium text-amber-700">Chờ Thanh Toán</p>
          <p className="mt-1 text-xl font-bold text-amber-900">{pendingCount} đơn</p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200/60 bg-white p-4 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, email, hoặc tên khóa học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-4 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="h-4 w-4 text-gray-400 mr-1 hidden sm:inline" />
          {[
            { id: "ALL", label: `Tất cả (${orders.length})` },
            { id: "PAID", label: "PAID" },
            { id: "PENDING", label: "PENDING" },
            { id: "CANCELLED", label: "CANCELLED" },
            { id: "FAILED", label: "FAILED" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setStatusFilter(btn.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === btn.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-gray-200/60 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Mã Đơn</th>
                <th className="px-6 py-3.5 font-semibold">Người Mua</th>
                <th className="px-6 py-3.5 font-semibold">Khóa Học</th>
                <th className="px-6 py-3.5 font-semibold">Ngày Tạo</th>
                <th className="px-6 py-3.5 font-semibold">Số Tiền</th>
                <th className="px-6 py-3.5 font-semibold">Trạng Thái</th>
                <th className="px-6 py-3.5 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const formattedDate = new Date(order.createdAt).toLocaleString("vi-VN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const isCurrentlyUpdating = updatingId === order.id;

                return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-bold text-indigo-600">
                      #{order.orderCode}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-medium text-gray-900 text-xs sm:text-sm">
                        {order.user.name || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">{order.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate text-xs sm:text-sm font-medium text-gray-800" title={order.course.title}>
                        {order.course.title}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-gray-500">
                      {formattedDate}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-bold text-gray-900 text-xs sm:text-sm">
                      {order.amount.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        {isCurrentlyUpdating && (
                          <Loader2 className="h-4 w-4 animate-spin text-indigo-600 shrink-0" />
                        )}
                        <select
                          disabled={isCurrentlyUpdating || isPending}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-2xs transition-colors hover:border-indigo-300 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                        >
                          <option value="PAID">Thành công (PAID)</option>
                          <option value="PENDING">Chờ thanh toán (PENDING)</option>
                          <option value="CANCELLED">Đã hủy (CANCELLED)</option>
                          <option value="FAILED">Thất bại (FAILED)</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <ShoppingBag className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                    Không tìm thấy đơn hàng nào phù hợp.
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
