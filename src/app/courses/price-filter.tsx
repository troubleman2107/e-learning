"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function PriceFilter({ maxPriceLimit }: { maxPriceLimit: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentPriceParam = searchParams.get("maxPrice");
  const initialPrice = currentPriceParam ? Number(currentPriceParam) : maxPriceLimit;
  const [price, setPrice] = useState(initialPrice);

  useEffect(() => {
    const currentPriceParam = searchParams.get("maxPrice");
    setPrice(currentPriceParam ? Number(currentPriceParam) : maxPriceLimit);
  }, [searchParams, maxPriceLimit]);

  // Debounced push to URL when price slider changes
  useEffect(() => {
    const currentPriceParamVal = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : maxPriceLimit;
    if (price === currentPriceParamVal) {
      return;
    }

    const timer = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        // Reset page back to 1 when filters change
        params.delete("page");
        
        if (price < maxPriceLimit) {
          params.set("maxPrice", price.toString());
        } else {
          params.delete("maxPrice");
        }
        router.push(`/courses?${params.toString()}`);
      });
    }, 300); // 300ms debounce for smooth dragging without server spamming

    return () => clearTimeout(timer);
  }, [price, router, searchParams, maxPriceLimit]);

  const formatVnd = (amount: number) => {
    return `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
  };

  return (
    <div className="w-full space-y-3.5 p-4 rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Khoảng giá</span>
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full transition-all">
          {price === maxPriceLimit ? "Tất cả" : `<= ${formatVnd(price)}`}
        </span>
      </div>
      <div className="relative pt-1">
        <input
          type="range"
          min={0}
          max={maxPriceLimit}
          step={10000} // Steps of 10,000 VND
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-indigo-600 focus:outline-none"
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
        <span>0đ</span>
        <span>{formatVnd(maxPriceLimit)}</span>
      </div>
    </div>
  );
}
