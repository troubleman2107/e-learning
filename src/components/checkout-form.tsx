"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function CheckoutForm({ courseId, defaultEmail = "" }: { courseId: string; defaultEmail?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Vui lòng nhập email của bạn");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId, email }),
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

  return (
    <form onSubmit={handleCheckout} className="space-y-3">
      <Input
        type="email"
        placeholder="Nhập email của bạn"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
        className="h-12"
      />
      <Button 
        type="submit" 
        className="h-12 w-full rounded-lg text-base" 
        size="lg"
        disabled={loading}
      >
        <CreditCard data-icon="inline-start" className="size-4 mr-2" />
        {loading ? "Đang xử lý..." : "Mua khóa học ngay"}
      </Button>
    </form>
  );
}
