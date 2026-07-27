"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteCourse } from "./actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function DeleteCourseButton({
  courseId,
  courseTitle,
}: {
  courseId: string;
  courseTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    setIsPending(true);
    try {
      await deleteCourse(courseId);
      toast.success(`Xóa khóa học "${courseTitle}" thành công!`);
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Có lỗi xảy ra khi xóa khóa học");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-7 px-2 text-xs gap-1 text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0"
        title="Xóa khóa học"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Xóa
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Xác nhận xóa khóa học
            </DialogTitle>
            <DialogDescription className="pt-2 text-gray-600">
              Bạn có chắc chắn muốn xóa khóa học{" "}
              <strong className="text-gray-900">"{courseTitle}"</strong>?
              Hành động này không thể hoàn tác và sẽ xóa toàn bộ bài học liên quan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xóa khóa học
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
