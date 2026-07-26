"use client";

import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2, Upload } from "lucide-react";

interface ThumbnailUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ThumbnailUpload({
  value,
  onChange,
}: ThumbnailUploadProps) {
  const handleSuccess = (result: any) => {
    if (result?.info && typeof result.info === "object" && result.info.secure_url) {
      onChange(result.info.secure_url);
    }
  };

  if (value) {
    return (
      <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border border-border bg-muted shadow-xs transition-all hover:shadow-md">
        <Image
          src={value}
          alt="Thumbnail preview"
          fill
          className="object-cover rounded-lg"
          sizes="(max-width: 768px) 100vw, 400px"
        />
        <div className="absolute top-2 right-2 z-10">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => onChange("")}
            className="h-8 w-8 rounded-full shadow-md transition-transform hover:scale-105"
            title="Xóa ảnh"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Xóa ảnh</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <CldUploadWidget
      onSuccess={handleSuccess}
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "vietlearn_thumbnails"}
      options={{
        maxFiles: 1,
        resourceType: "image",
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "swmsqt0m",
      }}
    >
      {({ open }) => (
        <div
          onClick={() => open()}
          className="group relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-6 text-center transition-all hover:border-primary/50 hover:bg-muted/40 cursor-pointer max-w-md w-full"
        >
          <div className="rounded-full bg-background p-3 text-muted-foreground shadow-xs group-hover:scale-110 group-hover:text-primary transition-transform">
            <ImagePlus className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Tải ảnh Thumbnail lên
            </p>
            <p className="text-xs text-muted-foreground">
              Định dạng PNG, JPG, WEBP hoặc GIF
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
            className="mt-1 gap-2"
          >
            <Upload className="h-4 w-4" />
            Tải ảnh Thumbnail lên
          </Button>
        </div>
      )}
    </CldUploadWidget>
  );
}
