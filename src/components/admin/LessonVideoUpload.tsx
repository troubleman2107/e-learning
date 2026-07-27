"use client";

import { useState, useRef } from "react";
import {
  getOrCreateBunnyCollection,
  createBunnyVideoEntry,
  getBunnyStreamConfig,
} from "@/app/actions/bunny";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, UploadCloud, Video, RefreshCw, Loader2, FileVideo } from "lucide-react";
import { toast } from "sonner";

interface LessonVideoUploadProps {
  courseId: string;
  courseTitle: string;
  value: string; // current videoId
  onChange: (videoId: string) => void;
}

export function LessonVideoUpload({
  courseId,
  courseTitle,
  value,
  onChange,
}: LessonVideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate video format
    const validExtensions = [".mp4", ".mov", ".mkv"];
    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(fileExt) && !file.type.startsWith("video/")) {
      toast.error("Định dạng file không hợp lệ! Vui lòng chọn file .mp4, .mov, hoặc .mkv");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setSelectedFileName(file.name);

    try {
      // 1. Guarantee Collection exists on Bunny Stream
      toast.loading("Đang khởi tạo Collection trên Bunny Stream...", { id: "bunny-upload" });
      const collectionId = await getOrCreateBunnyCollection(courseId, courseTitle);

      // 2. Create Video entry in Collection
      toast.loading("Đang đăng ký Video entry...", { id: "bunny-upload" });
      const videoId = await createBunnyVideoEntry(file.name, collectionId);

      // 3. Retrieve Stream configuration (libraryId & apiKey)
      const { libraryId, apiKey } = await getBunnyStreamConfig();

      // 4. Direct binary upload using XMLHttpRequest for real-time progress
      toast.loading("Đang tải video lên Bunny Stream...", { id: "bunny-upload" });

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(
          "PUT",
          `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`
        );

        xhr.setRequestHeader("AccessKey", apiKey);
        xhr.setRequestHeader("Content-Type", "application/octet-stream");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Tải lên thất bại với mã lỗi ${xhr.status}: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Lỗi kết nối mạng khi tải video lên Bunny Stream"));
        };

        xhr.send(file);
      });

      setProgress(100);
      onChange(videoId);
      toast.success("✓ Tải video lên thành công!", { id: "bunny-upload" });
    } catch (error: any) {
      console.error("Bunny Stream upload error:", error);
      toast.error(error?.message || "Không thể tải video lên Bunny Stream", {
        id: "bunny-upload",
      });
      setProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className="space-y-3">
      {/* Current Upload Success Badge & Summary */}
      {value && !isUploading && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-semibold text-emerald-900">
                ✓ Video đã được gắn vào Collection
              </span>
              <div className="font-mono text-[11px] text-emerald-700 mt-0.5">
                Video ID: {value}
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5 text-xs text-emerald-800 border-emerald-300 hover:bg-emerald-100 bg-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Thay đổi video
          </Button>
        </div>
      )}

      {/* Uploading Progress State */}
      {isUploading && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-medium text-indigo-900 truncate max-w-[80%]">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600 shrink-0" />
              <span className="truncate">
                {selectedFileName || "Đang tải video..."}
              </span>
            </div>
            <span className="font-bold text-indigo-600 font-mono">{progress}%</span>
          </div>

          <Progress value={progress} className="h-2.5 bg-indigo-100" />

          <p className="text-[11px] text-indigo-600/80">
            Vui lòng giữ nguyên cửa sổ này cho đến khi quá trình tải video lên Bunny Stream hoàn tất.
          </p>
        </div>
      )}

      {/* File Dropzone */}
      {!value && !isUploading && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all ${
            isDragOver
              ? "border-indigo-500 bg-indigo-50/60 scale-[0.99]"
              : "border-gray-300 bg-gray-50/50 hover:border-indigo-400 hover:bg-indigo-50/30"
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="rounded-full bg-indigo-100 p-3 text-indigo-600">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-700">
                Nhấp để chọn video hoặc kéo thả vào đây
              </p>
              <p className="text-[11px] text-gray-500">
                Hỗ trợ các định dạng: <span className="font-mono text-gray-700">.mp4, .mov, .mkv</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/x-matroska,.mp4,.mov,.mkv"
        onChange={handleInputChange}
        disabled={isUploading}
        className="hidden"
      />
    </div>
  );
}
