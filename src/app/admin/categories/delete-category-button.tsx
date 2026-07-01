"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCategory } from "./actions";
import { toast } from "sonner";

export function DeleteCategoryButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.")) {
      startTransition(async () => {
        try {
          await deleteCategory(id);
          toast.success("Xóa danh mục thành công!");
        } catch (error) {
          toast.error("Có lỗi xảy ra khi xóa danh mục.");
        }
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-gray-500 hover:text-red-600"
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
