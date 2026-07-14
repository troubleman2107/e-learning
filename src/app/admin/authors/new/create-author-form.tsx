"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createAuthor } from "../actions";

const formSchema = z.object({
  name: z.string().min(1, "Tên giảng viên không được để trống"),
  title: z.string().min(1, "Chức danh không được để trống"),
  bio: z.string().min(1, "Tiểu sử không được để trống"),
  details: z.string().min(1, "Chi tiết không được để trống"),
  image: z.string().url("URL hình ảnh không hợp lệ"),
  rating: z.string().min(1, "Đánh giá không được để trống"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateAuthorForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      title: "",
      bio: "",
      details: "",
      image: "",
      rating: "4.9",
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        await createAuthor(data);
        toast.success("Giảng viên đã được thêm thành công!");
      } catch {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-1.5 text-gray-500"
        >
          <Link href="/admin/authors">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Thêm giảng viên mới
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Điền thông tin chi tiết của giảng viên để lưu trên hệ thống.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm"
      >
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Tên giảng viên *</Label>
          <Input
            id="name"
            placeholder="Ví dụ: Dr. Hoàng Minh"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Chức danh *</Label>
          <Input
            id="title"
            placeholder="Ví dụ: AI Specialist & Researcher"
            {...register("title")}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Image */}
        <div className="space-y-2">
          <Label htmlFor="image">URL Hình ảnh (Avatar) *</Label>
          <Input
            id="image"
            placeholder="Ví dụ: https://images.unsplash.com/photo-..."
            {...register("image")}
          />
          {errors.image && (
            <p className="text-sm text-red-500">{errors.image.message}</p>
          )}
        </div>

        {/* Rating */}
        <div className="space-y-2">
          <Label htmlFor="rating">Đánh giá (Rating) *</Label>
          <Input
            id="rating"
            placeholder="Ví dụ: 4.9"
            {...register("rating")}
          />
          {errors.rating && (
            <p className="text-sm text-red-500">{errors.rating.message}</p>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Tiểu sử ngắn *</Label>
          <Textarea
            id="bio"
            placeholder="Tiểu sử tóm tắt (hiển thị ở thẻ info)..."
            rows={3}
            {...register("bio")}
          />
          {errors.bio && (
            <p className="text-sm text-red-500">{errors.bio.message}</p>
          )}
        </div>

        {/* Details */}
        <div className="space-y-2">
          <Label htmlFor="details">Thông tin chi tiết *</Label>
          <Textarea
            id="details"
            placeholder="Thông tin giới thiệu chi tiết (hiển thị ở tab Author)..."
            rows={5}
            {...register("details")}
          />
          {errors.details && (
            <p className="text-sm text-red-500">{errors.details.message}</p>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/authors")}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Đang tạo..." : "Tạo giảng viên"}
          </Button>
        </div>
      </form>
    </div>
  );
}
