'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/utils';
import { Pencil, Check, X, FileText, Eye, Edit2 } from 'lucide-react';
import { toast } from '@/src/components/ui/Toaster';

interface NoteEditorProps {
  id: string;
  initialNote?: string;
  onSave: (id: string, note: string) => void;
  className?: string;
}

export function NoteEditor({ id, initialNote = '', onSave, className }: NoteEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(initialNote);
  const [tempNote, setTempNote] = useState(initialNote);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setNote(initialNote);
    setTempNote(initialNote);
  }, [initialNote]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = tempNote.trim();
    onSave(id, trimmed);
    setNote(trimmed);
    setIsEditing(false);
    setViewMode('edit');
    toast.success('Đã lưu ghi chú');
  };

  const handleCancel = () => {
    setTempNote(note);
    setIsEditing(false);
    setViewMode('edit');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  const hasNote = note && note.length > 0;

  // Custom Markdown components
  const MarkdownComponents = {
    h1: ({ children }: any) => <h1 className="text-xl font-bold my-2 text-amber-950 dark:text-amber-100">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-lg font-bold my-2 text-amber-900 dark:text-amber-100">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-base font-bold my-1 text-amber-905 dark:text-amber-200">{children}</h3>,
    p: ({ children }: any) => <p className="my-1.5 leading-relaxed text-slate-700 dark:text-gray-350">{children}</p>,
    ul: ({ children }: any) => <ul className="list-disc ml-5 my-2 space-y-1 text-slate-705 dark:text-gray-350">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal ml-5 my-2 space-y-1 text-slate-705 dark:text-gray-350">{children}</ol>,
    li: ({ children }: any) => <li className="my-0.5">{children}</li>,
    strong: ({ children }: any) => <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => (
      <code className="bg-amber-100/50 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono text-amber-900 dark:text-amber-200">{children}</code>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-amber-500 pl-4 my-2 italic text-slate-600 dark:text-gray-400 font-serif bg-amber-50/30 py-1 pr-2 rounded-r-md">
        {children}
      </blockquote>
    ),
    a: ({ href, children }: any) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-amber-705 dark:text-amber-400 hover:underline font-semibold">
        {children}
      </a>
    ),
  };

  return (
    <div className={cn('space-y-3 bg-[#FAF7F2] dark:bg-gray-850 p-5 rounded-2xl border border-amber-100/50', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-amber-950 dark:text-amber-250">
          <FileText className="w-4 h-4 text-amber-800" />
          <span className="font-semibold">Ghi chú cá nhân</span>
          {hasNote && !isEditing && (
            <span className="text-xs text-slate-400 dark:text-gray-500 font-normal font-mono">
              ({note.length} ký tự)
            </span>
          )}
        </div>
        {!isEditing && (
          <button
            onClick={() => {
              setIsEditing(true);
              setViewMode('edit');
            }}
            className="text-sm font-semibold text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            {hasNote ? 'Sửa ghi chú' : 'Thêm ghi chú'}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          {/* Thanh công cụ chuyển đổi chế độ */}
          <div className="flex items-center gap-1.5 text-xs border-b border-amber-200/20 dark:border-gray-700 pb-2">
            <button
              onClick={() => setViewMode('edit')}
              className={cn(
                'px-3 py-1 rounded-lg transition-all flex items-center gap-1 font-semibold cursor-pointer',
                viewMode === 'edit'
                  ? 'bg-amber-950 text-amber-200 shadow-sm'
                  : 'hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-655 dark:text-gray-400'
              )}
            >
              <Edit2 className="w-3 h-3" />
              Viết ghi chú
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={cn(
                'px-3 py-1 rounded-lg transition-all flex items-center gap-1 font-semibold cursor-pointer',
                viewMode === 'preview'
                  ? 'bg-amber-950 text-amber-200 shadow-sm'
                  : 'hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-655 dark:text-gray-400'
              )}
            >
              <Eye className="w-3 h-3" />
              Xem trước
            </button>
            <span className="text-[10px] text-amber-800/80 font-mono ml-auto tracking-wider uppercase">
              Hỗ trợ Markdown ✨
            </span>
          </div>

          {/* Nội dung */}
          {viewMode === 'edit' ? (
            <textarea
              ref={textareaRef}
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập ghi chú của bạn về hiện vật này... Hỗ trợ định dạng Markdown (ví dụ: **chữ đậm**, *in nghiêng*, - danh sách, v.v.)"
              className="w-full min-h-[140px] p-3 rounded-xl border border-amber-200/50 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 resize-y focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-shadow text-sm font-mono leading-relaxed"
              maxLength={2000}
            />
          ) : (
            <div className="min-h-[140px] p-4 rounded-xl border border-amber-200/30 dark:border-gray-750 bg-white dark:bg-gray-900 max-w-none overflow-y-auto text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                {tempNote || '*Ghi chú trống*'}
              </ReactMarkdown>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 dark:text-gray-500 font-mono">
              {tempNote.length}/2000
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 rounded-lg text-sm text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-3.5 py-1.5 rounded-lg text-sm bg-amber-950 hover:bg-amber-900 text-amber-200 transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                <Check className="w-3.5 h-3.5" />
                Lưu
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'p-4 rounded-xl bg-white dark:bg-gray-800/50 border border-slate-100 dark:border-gray-705 min-h-[60px] transition-colors text-sm',
            !hasNote && 'text-slate-405 dark:text-gray-500 italic'
          )}
        >
          {hasNote ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
              {note}
            </ReactMarkdown>
          ) : (
            <p className="text-slate-500 dark:text-gray-400">Chưa có ghi chú nào cho hiện vật này. Hãy thêm suy nghĩ, thông tin bổ sung hoặc kết quả nghiên cứu của bạn dưới định dạng Markdown.</p>
          )}
        </div>
      )}
    </div>
  );
}
