"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteLesson } from "./actions";
import { toast } from "sonner";

export function DeleteLessonButton({
  lessonId,
  courseId,
}: {
  lessonId: string;
  courseId: string;
}) {
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài học này không? Hành động này không thể hoàn tác.")) {
      return;
    }

    setIsPending(true);
    try {
      await deleteLesson(lessonId, courseId);
      toast.success("Xóa bài học thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa bài học");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
      className="h-7 text-gray-400 hover:text-red-600 self-end sm:self-auto"
    >
      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
    </Button>
  );
}
