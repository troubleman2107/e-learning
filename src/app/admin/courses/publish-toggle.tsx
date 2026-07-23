"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleCoursePublish } from "./actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PublishToggleProps {
  id: string;
  initialIsPublished: boolean;
}

export function PublishToggle({ id, initialIsPublished }: PublishToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      try {
        await toggleCoursePublish(id, checked);
        toast.success(
          checked
            ? "Khóa học đã được công khai thành công!"
            : "Đã chuyển khóa học thành bản nháp!"
        );
      } catch (error) {
        console.error("Toggle error:", error);
        toast.error("Không thể thay đổi trạng thái khóa học.");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />}
      <Switch
        checked={initialIsPublished}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
      <span
        className={`text-xs font-medium transition-colors duration-200 ${
          initialIsPublished ? "text-emerald-700 font-semibold" : "text-slate-400 font-normal"
        }`}
      >
        {initialIsPublished ? "Công khai" : "Bản nháp"}
      </span>
    </div>
  );
}
