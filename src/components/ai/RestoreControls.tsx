'use client';

import { Wand2, Loader2 } from 'lucide-react';
import { cn } from '@/utils';

interface RestoreControlsProps {
  onRestore: () => void;
  isProcessing: boolean;
  hasImage: boolean;
  disabled?: boolean;
  className?: string;
}

export function RestoreControls({
  onRestore,
  isProcessing,
  hasImage,
  disabled,
  className,
}: RestoreControlsProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Các tùy chọn nâng cao (có thể mở rộng sau) */}
      <button
        onClick={onRestore}
        disabled={!hasImage || isProcessing || disabled}
        className={cn(
          'w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer',
          hasImage && !isProcessing && !disabled
            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-amber-500/30'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
        )}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            Phục hồi ảnh
          </>
        )}
      </button>
    </div>
  );
}
