"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCourse } from "../actions";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Category, Author } from "@/generated/prisma/client";

const formSchema = z.object({
  title: z.string().min(1, "Tên khóa học không được để trống"),
  description: z.string().min(1, "Mô tả không được để trống"),
  price: z.coerce.number().int().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  trailerUrl: z.string().url("URL giới thiệu không hợp lệ"),
  bunnyVideoId: z.string().optional(),
  categoryId: z.string().optional(),
  authorId: z.string().optional(),
  shortDescription: z.string().optional(),
  thumbnail: z.string().optional(),
  whatYouWillLearn: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateCourseFormProps {
  categories: Category[];
  authors: Author[];
}

export function CreateCourseForm({ categories, authors }: CreateCourseFormProps) {
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
      title: "",
      description: "",
      price: 0,
      trailerUrl: "",
      bunnyVideoId: "",
      categoryId: undefined,
      authorId: undefined,
      shortDescription: "",
      thumbnail: "",
      whatYouWillLearn: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        await createCourse(data);
        toast.success("Khóa học đã được tạo thành công!");
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
          <Link href="/admin/courses">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Thêm khóa học mới
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Điền thông tin bên dưới để tạo một khóa học mới.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm"
      >
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Tên khóa học *</Label>
          <Input
            id="title"
            placeholder="Ví dụ: Lập trình React từ cơ bản đến nâng cao"
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
        {/* Author */}
        <div className="space-y-2">
          <Label htmlFor="authorId">Giảng viên</Label>
          <Controller
            control={control}
            name="authorId"
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giảng viên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Không chọn --</SelectItem>
                  {authors.map((author) => (
                    <SelectItem key={author.id} value={author.id}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.authorId && (
            <p className="text-sm text-red-500">{errors.authorId.message}</p>
          )}
        </div>
        {/* Short Description */}
        <div className="space-y-2">
          <Label htmlFor="shortDescription">Mô tả ngắn (Hiển thị ở Thumbnail/Carousel)</Label>
          <Textarea
            id="shortDescription"
            placeholder="Tóm tắt ngắn gọn nội dung khóa học..."
            rows={3}
            {...register("shortDescription")}
          />
          {errors.shortDescription && (
            <p className="text-sm text-red-500">{errors.shortDescription.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Mô tả *</Label>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.description && (
            <p className="text-sm text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* What You Will Learn */}
        <div className="space-y-2">
          <Label htmlFor="whatYouWillLearn">Bạn sẽ học được gì (nhập mỗi dòng một ý)</Label>
          <Textarea
            id="whatYouWillLearn"
            placeholder={`Ví dụ:\nLàm chủ các công cụ AI\nTối ưu quy trình công việc\nThiết kế prompt tối ưu`}
            rows={4}
            {...register("whatYouWillLearn")}
          />
          {errors.whatYouWillLearn && (
            <p className="text-sm text-red-500">
              {errors.whatYouWillLearn.message}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">Giá (VNĐ) *</Label>
          <Input
            id="price"
            type="number"
            placeholder="Ví dụ: 699000"
            {...register("price")}
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price.message}</p>
          )}
        </div>

        {/* Trailer URL */}
        <div className="space-y-2">
          <Label htmlFor="trailerUrl">URL Video giới thiệu *</Label>
          <Input
            id="trailerUrl"
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            {...register("trailerUrl")}
          />
          {errors.trailerUrl && (
            <p className="text-sm text-red-500">
              {errors.trailerUrl.message}
            </p>
          )}
        </div>

        {/* Thumbnail URL */}
        <div className="space-y-2">
          <Label htmlFor="thumbnail">URL ảnh thu nhỏ (Thumbnail)</Label>
          <Input
            id="thumbnail"
            type="text"
            placeholder="Ví dụ: /course-docker.png hoặc https://..."
            {...register("thumbnail")}
          />
          {errors.thumbnail && (
            <p className="text-sm text-red-500">
              {errors.thumbnail.message}
            </p>
          )}
        </div>

        {/* BunnyVideoId */}
        <div className="space-y-2">
          <Label htmlFor="bunnyVideoId">Bunny Stream Video ID</Label>
          <Input
            id="bunnyVideoId"
            placeholder="Ví dụ: b3d9c7f1-..."
            {...register("bunnyVideoId")}
          />
          {errors.bunnyVideoId && (
            <p className="text-sm text-red-500">
              {errors.bunnyVideoId.message}
            </p>
          )}
        </div>

        {/* Submit */}
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
            {isPending ? "Đang tạo..." : "Tạo khóa học"}
          </Button>
        </div>
      </form>
    </div>
  );
}
