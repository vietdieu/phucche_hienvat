'use client';

import React, { useRef, DragEvent, ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/utils';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export function DropZone({ onFileSelect, isLoading, error, className }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
    e.target.value = '';
  };

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer',
        isDragOver
          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
          : 'border-gray-300 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-600',
        isLoading && 'opacity-50 pointer-events-none',
        error && 'border-red-500 dark:border-red-500',
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/tiff,image/webp"
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/40">
          <Upload className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Kéo và thả ảnh vào đây
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            hoặc <span className="text-amber-600 dark:text-amber-400 font-semibold">chọn file</span>
          </p>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Hỗ trợ JPG, PNG, TIFF, WEBP (tối đa 20MB)
        </p>
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
