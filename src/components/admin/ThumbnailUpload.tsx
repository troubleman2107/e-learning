"use client";

import { useEffect, useCallback } from "react";
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
  const restoreScroll = useCallback(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = "auto";
      document.body.style.pointerEvents = "auto";
      document.documentElement.style.overflow = "auto";
    }
    // Double check after animation frame
    setTimeout(() => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "auto";
        document.body.style.pointerEvents = "auto";
        document.documentElement.style.overflow = "auto";
      }
    }, 150);
  }, []);

  useEffect(() => {
    return () => {
      restoreScroll();
    };
  }, [restoreScroll]);

  const handleSuccess = (result: any) => {
    if (result?.info && typeof result.info === "object" && result.info.secure_url) {
      onChange(result.info.secure_url);
    }
    restoreScroll();
  };

  const handleOpenWidget = (openFn: () => void) => {
    openFn();
    // Monitor iframe dismissal to unlock body scroll
    const checkInterval = setInterval(() => {
      const iframe = document.querySelector("iframe[src*='cloudinary']");
      if (!iframe) {
        restoreScroll();
        clearInterval(checkInterval);
      }
    }, 500);
  };

  if (value) {
    return (
      <div className="relative aspect-square w-40 overflow-hidden rounded-xl border border-border bg-muted shadow-xs transition-all hover:shadow-md">
        <Image
          src={value}
          alt="Thumbnail preview"
          fill
          className="object-cover rounded-xl"
          sizes="160px"
        />
        <div className="absolute top-2 right-2 z-10">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => onChange("")}
            className="h-7 w-7 rounded-full shadow-md transition-transform hover:scale-105"
            title="Xóa ảnh"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Xóa ảnh</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <CldUploadWidget
      onSuccess={handleSuccess}
      onClose={restoreScroll}
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "vietlearn_thumbnails"}
      options={{
        maxFiles: 1,
        resourceType: "image",
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "swmsqt0m",
      }}
    >
      {({ open }) => (
        <div
          onClick={() => handleOpenWidget(open)}
          className="group relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-6 text-center transition-all hover:border-primary/50 hover:bg-muted/40 cursor-pointer max-w-md w-full"
        >
          <div className="rounded-full bg-background p-3 text-muted-foreground shadow-xs group-hover:scale-110 group-hover:text-primary transition-transform">
            <ImagePlus className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Tải ảnh đại diện / Thumbnail lên
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
              handleOpenWidget(open);
            }}
            className="mt-1 gap-2"
          >
            <Upload className="h-4 w-4" />
            Tải ảnh lên
          </Button>
        </div>
      )}
    </CldUploadWidget>
  );
}
