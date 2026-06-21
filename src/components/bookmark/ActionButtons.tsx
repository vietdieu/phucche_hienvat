'use client';

import React from 'react';
import { Trash2, Share2, Download } from 'lucide-react';
import { cn } from '@/utils';
import { toast } from '@/src/components/ui/Toaster';

interface ActionButtonsProps {
  onDelete: () => void;
  imageUrl: string;
  title: string;
  className?: string;
}

export function ActionButtons({ onDelete, imageUrl, title, className }: ActionButtonsProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Khám phá di sản ${title} đã được phục chế trên CulturalVault`,
          url: window.location.href,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Không thể chia sẻ');
        }
      }
    } else {
      // Fallback: copy link
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Đã sao chép liên kết chia sẻ!');
      } catch (err) {
        toast.error('Không thể sao chép liên kết');
      }
    }
  };

  const handleDownload = async () => {
    try {
      if (imageUrl.startsWith('data:')) {
        // base64 image download
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${title.replace(/\s+/g, '_')}_restored.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Tải ảnh xuống thành công!');
        return;
      }

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '_')}_restored.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Đang thực hiện tải xuống...');
    } catch (error) {
      // Fallback if CORS or fetch errors
      const link = document.createElement('a');
      link.href = imageUrl;
      link.target = '_blank';
      link.download = `${title.replace(/\s+/g, '_')}_restored.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.info('Đang mở ảnh trong tab mới để tải xuống...');
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2 text-xs', className)}>
      <button
        onClick={handleShare}
        type="button"
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors font-medium text-slate-700 dark:text-gray-300 cursor-pointer"
      >
        <Share2 className="w-3.5 h-3.5" />
        Chia sẻ
      </button>

      <button
        onClick={handleDownload}
        type="button"
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors font-medium text-slate-700 dark:text-gray-300 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        Tải xuống
      </button>

      <button
        onClick={onDelete}
        type="button"
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-650 dark:text-red-400 transition-colors font-semibold cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Xóa sưu tập
      </button>
    </div>
  );
}
