"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, Trash2, Layers, ListPlus, FileText } from "lucide-react";
import { createLessons } from "./actions";
import { toast } from "sonner";

interface LessonRow {
  id: string;
  title: string;
  bunnyVideoId: string;
  isFreePreview: boolean;
}

function createEmptyRow(): LessonRow {
  return {
    id: Math.random().toString(36).substring(2, 9),
    title: "",
    bunnyVideoId: "",
    isFreePreview: false,
  };
}

export function CreateLessonModal({
  moduleId,
  courseId,
}: {
  moduleId: string;
  courseId: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [lessons, setLessons] = useState<LessonRow[]>([createEmptyRow()]);
  const [bulkText, setBulkText] = useState("");
  const [isPending, setIsPending] = useState(false);

  const resetForm = () => {
    setLessons([createEmptyRow()]);
    setBulkText("");
    setActiveTab("list");
  };

  const handleAddRow = () => {
    setLessons((prev) => [...prev, createEmptyRow()]);
  };

  const handleAddMultipleRows = (count: number) => {
    setLessons((prev) => [
      ...prev,
      ...Array.from({ length: count }, () => createEmptyRow()),
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (lessons.length <= 1) return;
    setLessons((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateRow = (
    id: string,
    field: keyof LessonRow,
    value: string | boolean
  ) => {
    setLessons((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleParseBulkText = () => {
    if (!bulkText.trim()) {
      toast.error("Vui lòng nhập danh sách bài học");
      return;
    }

    const lines = bulkText.split("\n").filter((line) => line.trim() !== "");
    const parsedRows: LessonRow[] = lines.map((line) => {
      let title = line.trim();
      let bunnyVideoId = "";
      let isFreePreview = false;

      if (line.includes("|")) {
        const parts = line.split("|").map((p) => p.trim());
        title = parts[0] || "";
        bunnyVideoId = parts[1] || "";
        if (parts[2] && (parts[2].toLowerCase() === "free" || parts[2].toLowerCase() === "true")) {
          isFreePreview = true;
        }
      } else if (line.includes("\t")) {
        const parts = line.split("\t").map((p) => p.trim());
        title = parts[0] || "";
        bunnyVideoId = parts[1] || "";
      }

      return {
        id: Math.random().toString(36).substring(2, 9),
        title,
        bunnyVideoId,
        isFreePreview,
      };
    });

    if (parsedRows.length === 0) {
      toast.error("Không tìm thấy dữ liệu bài học hợp lệ");
      return;
    }

    setLessons(parsedRows);
    setActiveTab("list");
    toast.success(`Đã phân tích ${parsedRows.length} bài học. Bạn có thể kiểm tra lại trước khi lưu.`);
  };

  const validLessonsCount = lessons.filter(
    (l) => l.title.trim() !== "" && l.bunnyVideoId.trim() !== ""
  ).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validLessons = lessons.filter(
      (l) => l.title.trim() !== "" && l.bunnyVideoId.trim() !== ""
    );

    if (validLessons.length === 0) {
      toast.error("Vui lòng nhập ít nhất 1 bài học với đầy đủ Tiêu đề và Video ID");
      return;
    }

    setIsPending(true);
    try {
      await createLessons({
        moduleId,
        courseId,
        lessons: validLessons,
      });
      toast.success(`Thêm thành công ${validLessons.length} bài học!`);
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error?.message || "Có lỗi xảy ra khi thêm bài học");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-medium"
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm bài học / buổi học
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600" />
            Thêm bài học vào module
          </DialogTitle>
          <DialogDescription>
            Bạn có thể thêm nhiều bài học cùng lúc hoặc nhập nhanh theo danh sách.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 pt-3 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2 mb-3">
              <TabsTrigger value="list" className="gap-2">
                <ListPlus className="h-4 w-4" />
                Danh sách bài học ({lessons.length})
              </TabsTrigger>
              <TabsTrigger value="bulk" className="gap-2">
                <FileText className="h-4 w-4" />
                Nhập nhanh hàng loạt
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-3 relative group transition-all hover:border-gray-300 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                      Bài #{index + 1}
                    </span>
                    {lessons.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveRow(lesson.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-700">Tiêu đề bài học *</Label>
                      <Input
                        value={lesson.title}
                        onChange={(e) => handleUpdateRow(lesson.id, "title", e.target.value)}
                        placeholder={`VD: ${index + 1}. Khái niệm cơ bản...`}
                        required
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-700">Bunny Video ID *</Label>
                      <Input
                        value={lesson.bunnyVideoId}
                        onChange={(e) => handleUpdateRow(lesson.id, "bunnyVideoId", e.target.value)}
                        placeholder="VD: 12345678-abcd-..."
                        required
                        className="bg-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`free-${lesson.id}`}
                        checked={lesson.isFreePreview}
                        onCheckedChange={(checked) => handleUpdateRow(lesson.id, "isFreePreview", checked)}
                      />
                      <Label htmlFor={`free-${lesson.id}`} className="text-xs text-gray-600 cursor-pointer">
                        Xem thử miễn phí
                      </Label>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap items-center gap-2 pt-2 pb-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRow}
                  className="gap-1.5 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm 1 dòng
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddMultipleRows(3)}
                  className="gap-1 text-xs text-gray-600"
                >
                  + 3 dòng
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddMultipleRows(5)}
                  className="gap-1 text-xs text-gray-600"
                >
                  + 5 dòng
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="bulk" className="flex-1 flex flex-col space-y-3 pt-1">
              <div className="rounded-md bg-amber-50 p-3 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-semibold">💡 Hướng dẫn nhập nhanh hàng loạt:</p>
                <p>Nhập hoặc dán danh sách bài học (mỗi bài trên 1 dòng). Định dạng:</p>
                <code className="block bg-amber-100/70 p-1.5 rounded font-mono text-[11px] text-amber-950">
                  Tiêu đề bài học | Bunny Video ID | free
                </code>
                <p className="text-amber-700 italic">* Phần "| free" là tùy chọn (để cho phép xem thử miễn phí).</p>
              </div>

              <Textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`Bài 1: Lời mở đầu & Giới thiệu | 11111111-2222-3333 | free\nBài 2: Chuẩn bị công cụ thực hành | 44444444-5555-6666\nBài 3: Kiến thức cốt lõi | 77777777-8888-9999`}
                className="flex-1 min-h-[180px] font-mono text-xs"
              />

              <Button
                type="button"
                variant="secondary"
                onClick={handleParseBulkText}
                className="self-end gap-1.5 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              >
                <ListPlus className="h-4 w-4" />
                Phân tích & Chuyển sang danh sách
              </Button>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between border-t pt-3 mt-auto">
            <div className="text-xs text-gray-500">
              {validLessonsCount > 0 ? (
                <span className="text-emerald-600 font-medium">
                  ✓ {validLessonsCount} bài học hợp lệ đã sẵn sàng
                </span>
              ) : (
                <span className="text-amber-600">
                  ⚠️ Nhập ít nhất 1 bài học (đủ Tiêu đề & Video ID)
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isPending || validLessonsCount === 0}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu {validLessonsCount > 0 ? `(${validLessonsCount} bài học)` : ""}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
