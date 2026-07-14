"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import { useEffect, useState } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Image as ImageIcon,
  Table as TableIcon,
  Heading1,
  Heading2,
  Quote,
  Code,
  Minus,
  Undo,
  Redo,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      ImageExtension.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4 inline-block",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full my-4",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "tiptap min-h-[180px] w-full rounded-b-xl border border-t-0 border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-hidden focus:outline-hidden prose prose-sm max-w-none focus:ring-1 focus:ring-indigo-500",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync value from react-hook-form to editor state when value changes outside the editor
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!mounted || !editor) {
    return (
      <div className="min-h-[220px] w-full rounded-xl border border-gray-200 bg-gray-50/50 animate-pulse flex items-center justify-center text-xs text-gray-400">
        Đang tải trình soạn thảo văn bản...
      </div>
    );
  }

  const addImage = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = window.prompt("Nhập URL hình ảnh:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = (e: React.MouseEvent) => {
    e.preventDefault();
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-2xs border border-gray-200 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-slate-50/85 p-2">
        {/* Undo */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().undo().run();
          }}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Hoàn tác"
        >
          <Undo className="h-4 w-4" />
        </button>

        {/* Redo */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().redo().run();
          }}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Làm lại"
        >
          <Redo className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-gray-200 mx-1" />

        {/* Heading 1 */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 1 }).run();
          }}
          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
            editor.isActive("heading", { level: 1 })
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
          title="Tiêu đề 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>

        {/* Heading 2 */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          }}
          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
            editor.isActive("heading", { level: 2 })
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
          title="Tiêu đề 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-gray-200 mx-1" />

        {/* Bold */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
          }}
          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
            editor.isActive("bold")
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
          title="In đậm"
        >
          <Bold className="h-4 w-4" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
          }}
          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
            editor.isActive("italic")
              ? "bg-indigo-100 text-indigo-700 italic"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
          title="In nghiêng"
        >
          <Italic className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-gray-200 mx-1" />

        {/* Bullet List */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBulletList().run();
          }}
          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
            editor.isActive("bulletList")
              ? "bg-indigo-100 text-indigo-700"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
          title="Danh sách dấu chấm"
        >
          <List className="h-4 w-4" />
        </button>

        {/* Ordered List */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleOrderedList().run();
          }}
          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
            editor.isActive("orderedList")
              ? "bg-indigo-100 text-indigo-700"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
          title="Danh sách số"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-gray-200 mx-1" />

        {/* Blockquote */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBlockquote().run();
          }}
          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
            editor.isActive("blockquote")
              ? "bg-indigo-100 text-indigo-700"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
          title="Trích dẫn"
        >
          <Quote className="h-4 w-4" />
        </button>

        {/* Code Block */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleCodeBlock().run();
          }}
          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
            editor.isActive("codeBlock")
              ? "bg-indigo-100 text-indigo-700"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
          title="Khối mã (Code block)"
        >
          <Code className="h-4 w-4" />
        </button>

        {/* Horizontal Rule */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().setHorizontalRule().run();
          }}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
          title="Đường kẻ ngang"
        >
          <Minus className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-gray-200 mx-1" />

        {/* Add Image */}
        <button
          type="button"
          onClick={addImage}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
          title="Thêm hình ảnh"
        >
          <ImageIcon className="h-4 w-4" />
        </button>

        {/* Add Table */}
        <button
          type="button"
          onClick={addTable}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
          title="Thêm bảng (3x3)"
        >
          <TableIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
