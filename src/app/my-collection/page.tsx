// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { useBookmarks } from '@/src/context/BookmarksContext';
import { ItemCard } from '@/src/components/cards/ItemCard';
import { ItemGrid } from '@/src/components/cards/ItemGrid';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { StatsDashboard } from '@/src/components/bookmark/StatsDashboard';
import { BatchExportSelector } from '@/src/components/bookmark/BatchExportSelector';
import { BarChart3, ChevronDown, ChevronUp, FileDown } from 'lucide-react';
import Link from 'next/link';

export default function MyCollectionPage() {
  const { bookmarks } = useBookmarks();
  const [showStats, setShowStats] = useState(false);
  const [showBatchExport, setShowBatchExport] = useState(false);

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl space-y-8">
      <div className="border-b border-amber-200/50 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-medium text-amber-950 dark:text-[#FBFBF9]">
            📚 Bộ Sưu Tập Di Sản Của Tôi
          </h1>
          <p className="text-xs font-mono text-amber-800 dark:text-amber-400 uppercase tracking-wider mt-1">
            Lưu trữ & Nghiên cứu Hồ Sơ Phục Chế Di Sản Văn Hóa
          </p>
        </div>
        
        {bookmarks.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setShowStats(!showStats);
                if (showBatchExport) setShowBatchExport(false); // Mutual exclusion for clean spaces
              }}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-amber-50/50 hover:bg-amber-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-705 dark:text-gray-300 border border-amber-150/30 transition-all cursor-pointer shadow-sm select-none"
            >
              <BarChart3 className="w-4 h-4 text-amber-700" />
              {showStats ? 'Ẩn số liệu' : 'Xem thống kê'}
              {showStats ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => {
                setShowBatchExport(!showBatchExport);
                if (showStats) setShowStats(false); // Mutual exclusion for clean spaces
              }}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-amber-950 text-amber-200 hover:bg-amber-900 border border-amber-900 transition-all cursor-pointer shadow-sm select-none"
            >
              <FileDown className="w-4 h-4 text-amber-300" />
              {showBatchExport ? 'Ẩn bảng xuất' : 'Xuất Nhiều PDF'}
            </button>

            <p className="text-xs font-semibold text-slate-500 bg-[#FAF7F2] dark:bg-gray-800 dark:border-gray-700 px-3.5 py-2.5 rounded-xl border border-amber-100/50">
              Tổng số hiện vật: <span className="font-bold text-amber-900 dark:text-amber-400 font-mono">{bookmarks.length}</span>
            </p>
          </div>
        )}
      </div>

      {/* Selective Batch Export Panel */}
      {bookmarks.length > 0 && showBatchExport && (
        <div className="animate-fade-in">
          <BatchExportSelector />
        </div>
      )}

      {/* Conditionally Render StatsDashboard with fine entry animations */}
      {bookmarks.length > 0 && showStats && (
        <div className="p-6 rounded-3xl bg-[#FAF7F2]/50 dark:bg-gray-900 border border-amber-100/20 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-amber-200/10 pb-3">
            <h2 className="text-sm uppercase font-mono font-bold text-amber-950 dark:text-amber-200 tracking-wider">
              📊 Tổng quan bảng số liệu nghiên cứu
            </h2>
          </div>
          <StatsDashboard bookmarks={bookmarks} />
        </div>
      )}

      {bookmarks.length === 0 ? (
        <EmptyState
          title="Chưa có hiện vật nào trong bộ sưu tập"
          description="Hãy tải ảnh lên, phục hồi hiện vật bằng AI để nhận diện lịch sử và lưu trữ những bảo vật di sản yêu thích của bạn."
          action={{
            label: 'Bắt đầu phục chế ngay',
            href: '/',
          }}
        />
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm uppercase font-mono font-bold text-amber-950 dark:text-amber-300 tracking-wider">
            🏛️ Danh sách hiện vật đã kết nối ({bookmarks.length})
          </h2>
          <ItemGrid items={bookmarks}>
            {(item) => (
              <Link key={item.id} href={`/bookmark/${item.id}`} className="no-underline focus:outline-none">
                <ItemCard item={item} />
              </Link>
            )}
          </ItemGrid>
        </div>
      )}
    </div>
  );
}

