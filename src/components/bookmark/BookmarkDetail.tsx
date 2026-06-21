// @ts-nocheck
'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BookmarkItem } from '@/src/types';
import { ImageComparison } from './ImageComparison';
import { ActionButtons } from './ActionButtons';
import { ExportPDFButton } from './ExportPDFButton';
import { useBookmarks } from '@/src/context/BookmarksContext';
import { NoteEditor } from './NoteEditor';
import { ReminderEditor } from './ReminderEditor';
import { ArrowLeft, Calendar, MapPin, Tag, Award } from 'lucide-react';
import { cn } from '@/utils';
import { toast } from '@/src/components/ui/Toaster';
import { AINarrator } from './AINarrator';

interface BookmarkDetailProps {
  bookmark: BookmarkItem;
}

export function BookmarkDetail({ bookmark }: BookmarkDetailProps) {
  const router = useRouter();
  const { removeBookmark, updateBookmarkNote, updateBookmarkReminder } = useBookmarks();

  const handleDelete = () => {
    if (confirm('Bạn có chắc muốn xóa bookmark này?')) {
      removeBookmark(bookmark.id);
      toast.success('Đã xóa khỏi bộ sưu tập');
      router.push('/my-collection');
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const hasAI = bookmark.isAIRestored && bookmark.recognition;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Nút quay lại */}
      <button
        onClick={handleGoBack}
        className="flex items-center gap-2 text-sm text-amber-900 border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 px-4 py-1.5 rounded-full transition-colors cursor-pointer select-none"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại bộ sưu tập
      </button>

      {/* Tiêu đề */}
      <div className="border-b border-amber-200/50 pb-4">
        <h1 className="text-3xl md:text-4xl font-display font-medium text-amber-950 dark:text-[#FBFBF9]">
          {bookmark.title}
        </h1>
        {bookmark.category && (
          <span className="inline-block mt-2 px-2.5 py-1 text-[10px] font-mono font-bold rounded-full bg-amber-950 text-amber-200 uppercase tracking-wider">
            {bookmark.category}
          </span>
        )}
      </div>

      {/* So sánh ảnh */}
      {bookmark.restoredImage && bookmark.imageUrl ? (
        <ImageComparison
          beforeImage={bookmark.imageUrl}
          afterImage={bookmark.restoredImage}
          beforeLabel="Ảnh gốc di sản"
          afterLabel="Ảnh phục chế cao"
        />
      ) : (
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-md border border-[#EAE3DE]">
          <Image
            src={bookmark.imageUrl}
            alt={bookmark.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      {/* Thông tin chi tiết */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cột trái: Thông tin cơ bản */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-sm font-mono font-bold tracking-wider text-amber-900 uppercase">Thông tin hiện vật</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-[#FAF7F2] dark:bg-gray-800/40 p-5 rounded-2xl border border-amber-100/50">
            {bookmark.description}
          </p>

          <div className="flex flex-wrap gap-4 text-sm bg-white dark:bg-gray-900 p-4 rounded-xl border border-slate-100">
            {bookmark.year && (
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-gray-400">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span className="font-semibold">Niên đại: {bookmark.year}</span>
              </div>
            )}
            {bookmark.location && (
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 text-rose-700" />
                <span className="font-semibold">Bảo tàng: {bookmark.location}</span>
              </div>
            )}
            {bookmark.rating && (
              <div className="flex items-center gap-1.5 text-amber-600">
                <Award className="w-4 h-4 fill-amber-500" />
                <span className="font-semibold">Đánh giá: {bookmark.rating} / 5</span>
              </div>
            )}
          </div>

          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 border-b border-amber-100/35 pb-4">
              {bookmark.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 rounded-full text-xs border border-amber-200/40 font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Ghi chú cá nhân */}
          <div className="pt-2 space-y-4">
            <NoteEditor
              id={bookmark.id}
              initialNote={bookmark.note}
              onSave={updateBookmarkNote}
            />
            <ReminderEditor
              id={bookmark.id}
              initialReminder={bookmark.reminder}
              onSave={updateBookmarkReminder}
            />
          </div>
        </div>

        {/* Cột phải: Nút hành động */}
        <div className="space-y-4">
          <h2 className="text-sm font-mono font-bold tracking-wider text-slate-500 uppercase">Thao tác lưu trữ</h2>
          <div className="p-4 bg-white dark:bg-gray-900 border border-slate-100 rounded-2xl shadow-sm space-y-3">
            <ActionButtons
              onDelete={handleDelete}
              imageUrl={bookmark.restoredImage || bookmark.imageUrl}
              title={bookmark.title}
            />
            <div className="border-t border-slate-100 dark:border-gray-800 pt-3">
              <ExportPDFButton bookmark={bookmark} className="w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* 🔮 Trợ lý Thuyết minh Di sản AI (Kép Groq + Gemini) */}
      <AINarrator bookmark={bookmark} />

      {/* Kết quả nhận diện AI */}
      {hasAI && (
        <div className="bg-gradient-to-r from-amber-50 to-amber-100/30 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl p-6 border border-amber-200/60 dark:border-amber-800/60 shadow-inner">
          <h3 className="text-base font-mono font-bold uppercase tracking-wider text-amber-950 dark:text-amber-200 flex items-center gap-2 border-b border-amber-200 pb-3 mb-4">
            <span className="text-xl">🤖</span>
            Hồ sơ nhận diện số bởi Gemini AI
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-white/70 dark:bg-gray-900/40 p-4 rounded-xl border border-white">
              <span className="font-mono text-xs text-amber-900 uppercase font-bold">Tên hiện vật khoa học</span>
              <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{bookmark.recognition!.objectName}</p>
            </div>
            <div className="bg-white/70 dark:bg-gray-900/40 p-4 rounded-xl border border-white">
              <span className="font-mono text-xs text-amber-900 uppercase font-bold">Nền văn hóa liên đới</span>
              <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{bookmark.recognition!.culture}</p>
            </div>
            <div className="bg-white/70 dark:bg-gray-900/40 p-4 rounded-xl border border-white">
              <span className="font-mono text-xs text-amber-900 uppercase font-bold">Thời kỳ lịch sử</span>
              <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{bookmark.recognition!.period}</p>
            </div>
            <div className="bg-white/70 dark:bg-gray-900/40 p-4 rounded-xl border border-white">
              <span className="font-mono text-xs text-amber-900 uppercase font-bold">Độ chính xác nhận dạng</span>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-600 rounded-full transition-all"
                    style={{ width: `${(bookmark.recognition!.confidence || 0) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold font-mono">
                  {((bookmark.recognition!.confidence || 0.95) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="sm:col-span-2 bg-white/70 dark:bg-gray-900/40 p-4 rounded-xl border border-white">
              <span className="font-mono text-xs text-amber-900 uppercase font-bold">Báo cáo phân tích chuyên môn</span>
              <p className="mt-1.5 text-gray-750 dark:text-gray-300 leading-relaxed text-sm">{bookmark.recognition!.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Thời gian tạo */}
      <div className="text-xs text-slate-400 dark:text-gray-500 text-right font-mono">
        Mã di sản: {bookmark.id} • Đã lưu vào bộ sưu tập: {new Date(bookmark.createdAt).toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  );
}
