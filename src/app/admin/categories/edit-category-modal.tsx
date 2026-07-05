"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Loader2, Pencil } from "lucide-react";
import { updateCategory } from "./actions";
import { toast } from "sonner";
import { Category } from "@/generated/prisma/client";

const schema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên danh mục"),
  slug: z.string().min(1, "Vui lòng nhập slug").regex(/^[a-z0-9-]+$/, "Slug không hợp lệ"),
});

type FormData = z.infer<typeof schema>;

export function EditCategoryModal({ category }: { category: Category }) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category.name,
      slug: category.slug,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await updateCategory(category.id, data);
      toast.success("Cập nhật danh mục thành công!");
      setOpen(false);
    } catch (error) {
      toast.error("Có lỗi xảy ra, có thể slug đã tồn tại.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) reset({ name: category.name, slug: category.slug });
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-indigo-600">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Danh Mục</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Tên danh mục *</Label>
            <Input {...register("name")} placeholder="VD: Lập trình Web" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Slug *</Label>
            <Input {...register("slug")} placeholder="VD: lap-trinh-web" />
            {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cập nhật
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
