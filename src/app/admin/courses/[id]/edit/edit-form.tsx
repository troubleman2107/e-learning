"use client";

import { useForm, Controller } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateCourse } from "../../actions";
import { Category } from "@/generated/prisma/client";

const formSchema = z.object({
  title: z.string().min(1, "Tên khóa học không được để trống"),
  description: z.string().min(1, "Mô tả không được để trống"),
  price: z.coerce.number().int().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  trailerUrl: z.string().url("URL giới thiệu không hợp lệ"),
  bunnyVideoId: z.string().optional(),
  categoryId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function EditCourseForm({ course, categories }: { course: any, categories: Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: course.title,
      description: course.description,
      price: course.price,
      trailerUrl: course.trailerUrl,
      bunnyVideoId: course.bunnyVideoId || "",
      categoryId: course.categoryId || "none",
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        await updateCourse(course.id, data);
        toast.success("Cập nhật khóa học thành công!");
      } catch {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-1.5 text-gray-500"
        >
          <Link href="/admin/courses">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Chỉnh sửa khóa học
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Cập nhật thông tin chi tiết của khóa học.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm"
      >
        <div className="space-y-2">
          <Label htmlFor="title">Tên khóa học *</Label>
          <Input
            id="title"
            placeholder="Ví dụ: Lập trình React..."
            {...register("title")}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="categoryId">Danh mục</Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Không chọn --</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && (
            <p className="text-sm text-red-500">{errors.categoryId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Mô tả *</Label>
          <Textarea
            id="description"
            rows={4}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-sm text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Giá (VNĐ) *</Label>
          <Input
            id="price"
            type="number"
            {...register("price")}
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="trailerUrl">URL Video giới thiệu *</Label>
          <Input
            id="trailerUrl"
            type="url"
            {...register("trailerUrl")}
          />
          {errors.trailerUrl && (
            <p className="text-sm text-red-500">
              {errors.trailerUrl.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bunnyVideoId">Bunny Stream Video ID</Label>
          <Input
            id="bunnyVideoId"
            {...register("bunnyVideoId")}
          />
          {errors.bunnyVideoId && (
            <p className="text-sm text-red-500">
              {errors.bunnyVideoId.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/courses")}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </div>
  );
}
