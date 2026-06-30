"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteModule } from "./actions";
import { toast } from "sonner";

export function DeleteModuleButton({
  moduleId,
  courseId,
}: {
  moduleId: string;
  courseId: string;
}) {
  const [isPending, setIsPending] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa module này không? Toàn bộ bài học bên trong cũng sẽ bị xóa.")) {
      return;
    }

    setIsPending(true);
    deleteModule(moduleId, courseId)
      .then(() => {
        toast.success("Xóa module thành công!");
      })
      .catch((error) => {
        toast.error("Có lỗi xảy ra khi xóa module");
      })
      .finally(() => {
        setIsPending(false);
      });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
      className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
