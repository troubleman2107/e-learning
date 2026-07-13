"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, XCircle, Copy, Check, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  orderCode: number;
  amount: number;
  courseTitle: string;
  courseId: string;
}

const TIMER_SECONDS = 10 * 60; // 10 minutes

const formatVnd = (amount: number) => {
  return `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
};

export function CheckoutModal({
  isOpen,
  onClose,
  onRetry,
  orderCode,
  amount,
  courseTitle,
  courseId,
}: CheckoutModalProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const endTimeRef = useRef<number>(0);

  // Bank details
  const bankName = "TPBank";
  const bankAccount = "21071997666";
  const accountHolder = "NGUYEN THAI BAO";
  const transferContent = `${orderCode}`;

  const qrUrl = `https://vietqr.app/img?bank=${bankName}&acc=${bankAccount}&template=&showinfo=true&holder=${encodeURIComponent(accountHolder)}&amount=${amount}&des=${orderCode}`;

  // Timestamp-based countdown timer — immune to tab throttling
  useEffect(() => {
    if (!isOpen) return;

    endTimeRef.current = Date.now() + TIMER_SECONDS * 1000;
    setTimeLeft(TIMER_SECONDS);

    const calcRemaining = () => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      return remaining;
    };

    const interval = setInterval(() => {
      if (calcRemaining() <= 0) clearInterval(interval);
    }, 1000);

    // Recalculate immediately when the user returns to this tab
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        if (calcRemaining() <= 0) clearInterval(interval);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isOpen]);

  const isExpired = timeLeft === 0;

  // Poll for payment status (stop when expired)
  useEffect(() => {
    if (!isOpen || isExpired) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/order-status?orderCode=${orderCode}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "PAID") {
            clearInterval(interval);
            toast.success("Thanh toán thành công! Chào mừng bạn.");
            onClose();
            router.push(`/course/${courseId}`);
          }
        }
      } catch (error) {
        console.error("Error checking order status:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, isExpired, orderCode, courseId, router, onClose]);

  // Copy to clipboard
  const handleCopy = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("Đã sao chép!");
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Không thể sao chép");
    }
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // ── Expired View ──
  if (isExpired) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onClose}
        />
        <div className="relative z-10 w-full max-w-[460px] mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
          <div className="rounded-2xl bg-[#1a1a2e] border border-gray-700/50 shadow-2xl shadow-black/40 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
                Thanh toán
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Expired Content */}
            <div className="flex flex-col items-center px-5 pt-6 pb-8">
              <div className="mb-5">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">
                Hết thời gian thanh toán
              </h3>
              <p className="text-gray-400 text-sm mb-8">
                Phiên thanh toán đã hết hạn. Vui lòng thử lại.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onRetry();
                }}
                className="rounded-xl border border-violet-500/50 bg-transparent px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-500/10 transition-all cursor-pointer"
              >
                Tạo thanh toán mới
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-[460px] mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="rounded-2xl bg-[#1a1a2e] border border-gray-700/50 shadow-2xl shadow-black/40 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
              </svg>
              Thanh toán
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Product info */}
          <div className="mx-5 mb-4 rounded-xl bg-[#16213e] border border-gray-600/30 p-4">
            <p className="text-gray-400 text-xs font-medium mb-1">Sản phẩm</p>
            <p className="text-white font-semibold text-sm truncate mb-1.5">
              {courseTitle}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-emerald-400 font-bold text-base">
                {formatVnd(amount)}
              </p>
              <div className="flex items-center gap-1.5 text-gray-300">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-sm font-semibold">{timerStr}</span>
              </div>
            </div>
          </div>

          {/* QR Code - Large & Centered */}
          <div className="mx-5 mb-4 flex flex-col items-center gap-2.5">
            <div className="rounded-2xl bg-white p-3 w-[220px] h-[220px] flex items-center justify-center overflow-hidden shadow-lg shadow-black/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="Payment QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center gap-1.5 text-violet-400 text-xs font-medium">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Đang chờ thanh toán...
            </div>
          </div>

          {/* Bank Details - Compact 2-col grid */}
          <div className="mx-5 mb-4 grid grid-cols-2 gap-2.5">
            <BankDetailRow label="Ngân hàng" value={bankName} />
            <BankDetailRow
              label="Số tài khoản"
              value={bankAccount}
              copyable
              copied={copiedField === "account"}
              onCopy={() => handleCopy(bankAccount, "account")}
            />
            <BankDetailRow
              label="Chủ tài khoản"
              value={accountHolder}
            />
            <BankDetailRow
              label="Số tiền"
              value={formatVnd(amount)}
              copyable
              copied={copiedField === "amount"}
              onCopy={() => handleCopy(String(amount), "amount")}
            />
          </div>

          {/* Transfer Content */}
          <div className="mx-5 mb-4 rounded-xl bg-[#16213e] border border-gray-600/30 p-4">
            <p className="text-gray-400 text-xs font-medium mb-1.5">
              Nội dung chuyển khoản
            </p>
            <div className="flex items-center justify-between">
              <span className="text-violet-400 font-mono font-bold text-lg tracking-wide">
                {transferContent}
              </span>
              <button
                onClick={() => handleCopy(transferContent, "content")}
                className="rounded-lg bg-white/5 border border-gray-600/40 p-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                {copiedField === "content" ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mx-5 mb-3 text-center">
            <p className="text-gray-400 text-xs leading-relaxed">
              Nhập <strong className="text-gray-200">ĐÚNG</strong> nội dung
              chuyển khoản để được xác nhận tự động.
            </p>
          </div>

          {/* Auto-confirmation banner */}
          <div className="mx-5 mb-4">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-center">
              <p className="text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Xác nhận tự động khi chuyển khoản thành công
              </p>
            </div>
          </div>

          {/* Support link */}
          <div className="mx-5 mb-5 text-center">
            <p className="text-gray-500 text-xs">
              Nếu đã chuyển tiền nhưng chưa được xác nhận sau 5 phút, vui lòng liên hệ{" "}
              <a href="#" className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors">
                support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for bank detail rows
function BankDetailRow({
  label,
  value,
  copyable = false,
  copied = false,
  onCopy,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  copied?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className="rounded-lg bg-[#16213e] border border-gray-600/20 p-2.5">
      <p className="text-gray-500 text-[10px] font-medium mb-0.5">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <p className="text-white text-sm font-bold truncate">{value}</p>
        {copyable && (
          <button
            onClick={onCopy}
            className="shrink-0 rounded-md bg-white/5 border border-gray-600/40 p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
