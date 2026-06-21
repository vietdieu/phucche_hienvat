'use client';

import React, { useState } from 'react';
import { useBookmarks } from '@/src/context/BookmarksContext';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { cn } from '@/utils';
import { toast } from '@/src/components/ui/Toaster';

interface SaveResultButtonProps {
  originalImage: string;          // Ảnh gốc (data URI hoặc URL)
  restoredImage: string;          // Ảnh đã phục hồi
  recognition: {
    objectName: string;
    culture: string;
    period: string;
    description: string;
    confidence: number;
    tags?: string[];
  };
  className?: string;
}

export function SaveResultButton({
  originalImage,
  restoredImage,
  recognition,
  className,
}: SaveResultButtonProps) {
  const { addBookmark, bookmarks, removeBookmark } = useBookmarks();
  const [isSaving, setIsSaving] = useState(false);

  // Kiểm tra xem đã lưu chưa bằng cách so sánh objectName trong bookmarks
  const savedItem = bookmarks.find((b) => b.recognition?.objectName === recognition.objectName);
  const saved = !!savedItem;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (saved) {
        // Nếu đã lưu, bấm lại sẽ gỡ khỏi bộ sưu tập
        removeBookmark(savedItem.id);
        toast.info('Đã xóa khỏi bộ sưu tập');
      } else {
        // Tạo tiêu đề từ tên hiện vật và văn hóa
        const title = `${recognition.objectName} - ${recognition.culture}`;

        // Lưu vào bookmark
        addBookmark({
          title,
          description: recognition.description,
          imageUrl: restoredImage || originalImage, // Ưu tiên ảnh đã phục hồi
          category: recognition.culture,
          tags: recognition.tags || [],
          // --- Dữ liệu AI ---
          restoredImage: restoredImage,
          recognition: {
            objectName: recognition.objectName,
            culture: recognition.culture,
            period: recognition.period,
            description: recognition.description,
            confidence: recognition.confidence,
          },
          isAIRestored: true,
        });

        toast.success('Đã lưu vào bộ sưu tập di sản!');
      }
    } catch (error) {
      toast.error('Không thể thực hiện tác vụ. Vui lòng thử lại.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isSaving}
      type="button"
      className={cn(
        'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 cursor-pointer shadow-md select-none',
        saved
          ? 'bg-[#1e1c16] text-[#fcb638] hover:bg-[#2e2b22] border border-amber-950 shadow-xs'
          : 'bg-amber-950 text-[#FAF7F2] hover:bg-amber-900 border border-amber-800 shadow-sm hover:shadow-amber-950/20',
        isSaving && 'opacity-70 cursor-wait',
        className
      )}
    >
      {isSaving ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Đang lưu...
        </>
      ) : saved ? (
        <>
          <BookmarkCheck className="w-4 h-4 text-[#fcb638]" />
          Được sưu tập
        </>
      ) : (
        <>
          <Bookmark className="w-4 h-4" />
          Lưu bộ sưu tập
        </>
      )}
    </button>
  );
}
