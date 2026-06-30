import { prisma } from "@/lib/prisma";
import { UsersTable } from "./users-table";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { orders: true },
      },
    },
  });

  // Serialize dates for the client component
  const serializedUsers = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    orderCount: user._count.orders,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Quản lý Người dùng
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Xem và quản lý tất cả người dùng trên hệ thống.
        </p>
      </div>

      <UsersTable users={serializedUsers} />
    </div>
  );
}
