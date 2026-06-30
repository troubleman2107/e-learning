"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";

type SerializedUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
  orderCount: number;
};

export function UsersTable({ users }: { users: SerializedUser[] }) {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Tìm kiếm theo email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200/60 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead className="w-12 font-semibold text-gray-600" />
              <TableHead className="font-semibold text-gray-600">
                Tên
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                Email
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                Vai trò
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                Số đơn hàng
              </TableHead>
              <TableHead className="font-semibold text-gray-600">
                Ngày tạo
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                {/* Avatar */}
                <TableCell>
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "Avatar"}
                      width={32}
                      height={32}
                      className="rounded-full ring-2 ring-gray-100"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-bold text-white">
                      {user.name?.charAt(0)?.toUpperCase() ||
                        user.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                </TableCell>

                {/* Name */}
                <TableCell className="font-medium text-gray-900">
                  {user.name || "—"}
                </TableCell>

                {/* Email */}
                <TableCell className="text-gray-600">{user.email}</TableCell>

                {/* Role */}
                <TableCell>
                  <Badge
                    variant={user.role === "ADMIN" ? "default" : "secondary"}
                    className={
                      user.role === "ADMIN"
                        ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-100"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                    }
                  >
                    {user.role === "ADMIN" ? "Admin" : "User"}
                  </Badge>
                </TableCell>

                {/* Order Count */}
                <TableCell className="text-gray-600">
                  {user.orderCount}
                </TableCell>

                {/* Created At */}
                <TableCell className="text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-gray-400"
                >
                  {search
                    ? `Không tìm thấy người dùng với email "${search}"`
                    : "Chưa có người dùng nào."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400">
        Hiển thị {filteredUsers.length} / {users.length} người dùng
      </p>
    </div>
  );
}
