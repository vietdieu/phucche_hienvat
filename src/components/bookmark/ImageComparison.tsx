'use client';

import React, { useState, useRef } from 'react';
import { cn } from '@/utils';

interface ImageComparisonProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function ImageComparison({
  beforeImage,
  afterImage,
  beforeLabel = 'Ảnh gốc',
  afterLabel = 'Đã phục hồi',
  className,
}: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSliderPosition(percentage);
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full aspect-[4/3] overflow-hidden rounded-xl select-none shadow-md border border-[#EAE3DE]', className)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* Ảnh sau (phục hồi) - luôn hiển thị toàn bộ */}
      <img
        src={afterImage}
        alt="Đã phục hồi"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Ảnh trước (gốc) - bị cắt theo slider */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeImage}
          alt="Ảnh gốc"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover max-w-none"
          style={{ width: containerRef.current?.getBoundingClientRect().width || '100vw' }}
        />
      </div>

      {/* Thanh trượt */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-amber-950 border border-amber-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/60 text-[#FAF7F2] font-mono text-[10px] font-bold uppercase px-3 py-1.5 rounded-md backdrop-blur-md tracking-wider border border-white/10">
        {beforeLabel}
      </div>
      <div className="absolute top-4 right-4 bg-amber-950/80 text-amber-200 font-mono text-[10px] font-bold uppercase px-3 py-1.5 rounded-md backdrop-blur-md tracking-wider border border-amber-500/20">
        {afterLabel}
      </div>
    </div>
  );
}
