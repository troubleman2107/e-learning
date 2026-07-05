"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function OrderStatusChecker({ orderCode, courseId }: { orderCode: number; courseId?: string }) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/order-status?orderCode=${orderCode}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "PAID") {
            clearInterval(interval);
            toast.success("Thanh toán thành công! Chào mừng bạn.");
            if (courseId) {
              router.push(`/course/${courseId}`);
            } else {
              router.push("/");
            }
          }
        }
      } catch (error) {
        console.error("Error checking order status:", error);
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [orderCode, router, courseId]);

  return null; // Hidden component
}
