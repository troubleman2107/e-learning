"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2 } from "lucide-react";
import { createLesson } from "./actions";
import { toast } from "sonner";

export function CreateLessonModal({
  moduleId,
  courseId,
}: {
  moduleId: string;
  courseId: string;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [bunnyVideoId, setBunnyVideoId] = useState("");
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !bunnyVideoId.trim()) return;

    setIsPending(true);
    try {
      await createLesson({
        moduleId,
        courseId,
        title,
        bunnyVideoId,
        isFreePreview,
      });
      toast.success("Thêm bài học thành công!");
      setOpen(false);
      setTitle("");
      setBunnyVideoId("");
      setIsFreePreview(false);
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
        >
          <Plus className="h-3 w-3" />
          Thêm bài học mới
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm bài học mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tiêu đề Bài học *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: 1.1. Lời mở đầu..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Bunny Video ID *</Label>
            <Input
              value={bunnyVideoId}
              onChange={(e) => setBunnyVideoId(e.target.value)}
              placeholder="VD: 12345678-abcd-..."
              required
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Xem thử miễn phí</Label>
              <p className="text-sm text-gray-500">
                Cho phép học viên xem bài này mà không cần mua khóa học.
              </p>
            </div>
            <Switch
              checked={isFreePreview}
              onCheckedChange={setIsFreePreview}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending || !title.trim() || !bunnyVideoId.trim()}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
