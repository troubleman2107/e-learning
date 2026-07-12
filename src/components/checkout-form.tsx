"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession, signIn } from "next-auth/react";

export function CheckoutForm({ courseId }: { courseId: string; defaultEmail?: string }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      toast.error("Vui lòng đăng nhập để thanh toán");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId, email: userEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra");
      }

      if (data.checkoutUrl) {
        router.push(data.checkoutUrl);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="space-y-3">
        <div className="h-12 w-full animate-pulse rounded-xl bg-gray-100" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="space-y-4 py-2">
        <p className="text-sm text-gray-500 text-center leading-relaxed">
          Bạn cần đăng nhập bằng tài khoản Google để tiếp tục thanh toán và lưu tiến trình học tập.
        </p>
        <Button
          type="button"
          onClick={() => signIn("google")}
          variant="outline"
          className="h-12 w-full gap-3 rounded-xl border border-gray-200 bg-white font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300 hover:shadow-md active:scale-98 cursor-pointer"
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Đăng nhập bằng Google
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Account Info Box */}
      <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3.5">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "Avatar"}
            className="h-10 w-10 rounded-full border border-white shadow-sm"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
            {session.user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tài khoản đăng ký</p>
          <p className="truncate text-sm font-bold text-gray-800">{session.user.name}</p>
          <p className="truncate text-xs text-gray-500">{session.user.email}</p>
        </div>
      </div>

      {/* Checkout Submit Button */}
      <form onSubmit={handleCheckout}>
        <Button 
          type="submit" 
          className="h-12 w-full rounded-xl text-base font-bold shadow-md shadow-indigo-100 bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer" 
          size="lg"
          disabled={loading}
        >
          <CreditCard className="size-4 mr-2" />
          {loading ? "Đang xử lý..." : "Thanh toán khóa học"}
        </Button>
      </form>
    </div>
  );
}

