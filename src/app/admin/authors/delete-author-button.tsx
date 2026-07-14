"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteAuthor } from "./actions";
import { toast } from "sonner";

export function DeleteAuthorButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      confirm(
        "Bạn có chắc chắn muốn xóa giảng viên này? Các khóa học liên kết sẽ không còn giảng viên."
      )
    ) {
      startTransition(async () => {
        try {
          await deleteAuthor(id);
          toast.success("Xóa giảng viên thành công!");
        } catch (error) {
          toast.error("Có lỗi xảy ra khi xóa giảng viên.");
        }
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-1.5 text-gray-500 hover:text-red-600"
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
      Xóa
    </Button>
  );
}
