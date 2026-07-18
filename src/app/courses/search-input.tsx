"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const initialSearch = searchParams.get("search") || "";
  const [value, setValue] = useState(initialSearch);

  useEffect(() => {
    setValue(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (value === currentSearch) return;

    const timer = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value.trim()) {
          params.set("search", value);
        } else {
          params.delete("search");
        }
        router.push(`/courses?${params.toString()}`);
      });
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [value, router, searchParams]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {isPending ? (
          <Loader2 className="size-4 animate-spin text-indigo-500" />
        ) : (
          <Search className="size-4 text-slate-400" />
        )}
      </div>
      <Input
        type="text"
        placeholder="Tìm kiếm khóa học..."
        className="h-10 pl-10 pr-4 text-sm bg-white border border-slate-200 focus-visible:ring-indigo-500"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
