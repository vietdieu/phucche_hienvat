'use client';

import React, { useState, useMemo } from 'react';
import { useBookmarks } from '../../context/BookmarksContext';
import { BookmarkItem } from '../../types';
import { BatchExportPDFButton } from './BatchExportPDFButton';
import { Search, Check, Square, ChevronDown, ChevronUp, Sliders, CheckSquare, Sparkles, Filter } from 'lucide-react';
import { cn } from '../../../utils';

interface BatchExportSelectorProps {
  className?: string;
}

export function BatchExportSelector({ className }: BatchExportSelectorProps) {
  const { bookmarks } = useBookmarks();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(bookmarks.map((b) => b.id))); // select all by default
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isExpanded, setIsExpanded] = useState(true);

  // Keep selectedIds in sync with bookmarks list changes (e.g. when user bookmarks a new item during demo, auto-select it!)
  React.useEffect(() => {
    setSelectedIds(new Set(bookmarks.map((b) => b.id)));
  }, [bookmarks]);

  // Filter bookmarks dynamic list
  const filteredBookmarks = useMemo(() => {
    let result = bookmarks || [];
    
    // 1. Filter by Search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title?.toLowerCase().includes(term) ||
          b.description?.toLowerCase().includes(term) ||
          b.category?.toLowerCase().includes(term) ||
          b.tags?.some((tag) => tag.toLowerCase().includes(term))
      );
    }
    
    // 2. Filter by Category
    if (categoryFilter !== 'All') {
      result = result.filter((b) => b.category === categoryFilter);
    }
    
    return result;
  }, [bookmarks, searchTerm, categoryFilter]);

  // Unique categories list
  const categoriesList = useMemo(() => {
    const list = new Set<string>();
    bookmarks.forEach((b) => {
      if (b.category) list.add(b.category);
    });
    return ['All', ...Array.from(list)];
  }, [bookmarks]);

  const selectedCount = selectedIds.size;
  const allSelected = filteredBookmarks.length > 0 && filteredBookmarks.every((b) => selectedIds.has(b.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      const newSet = new Set(selectedIds);
      filteredBookmarks.forEach((b) => newSet.delete(b.id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      filteredBookmarks.forEach((b) => newSet.add(b.id));
      setSelectedIds(newSet);
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectedBookmarks = useMemo(() => {
    return bookmarks.filter((b) => selectedIds.has(b.id));
  }, [bookmarks, selectedIds]);

  return (
    <div className={cn('bg-white dark:bg-gray-900 rounded-3xl border border-amber-100/10 dark:border-gray-800 shadow-sm overflow-hidden p-6 space-y-4', className)}>
      
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-amber-50/20 pb-3">
        <div>
          <h2 className="text-sm uppercase font-mono font-bold text-amber-950 dark:text-amber-200 tracking-wider flex items-center gap-1.5 animate-pulse">
            <CheckSquare className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            Trình quản lý đóng gói báo cáo PDF tuyển chọn
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">
            Lựa chọn linh hoạt, lọc theo danh mục, niên đại trước khi kết xuất tệp tài liệu số hóa.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 px-2 text-[10px] font-mono font-bold tracking-wider uppercase text-amber-700 bg-amber-50 dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-gray-700 border border-amber-100/40 rounded-lg cursor-pointer transition-all flex items-center gap-1"
        >
          {isExpanded ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-fade-in">
          {/* Controls Bar: select actions, filters and searches */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch justify-between bg-[#FAF7F2] dark:bg-gray-950 p-4 rounded-2xl border border-amber-100/10 shadow-inner">
            
            {/* Left: Checkboxes states */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-gray-900 hover:bg-amber-50 border border-amber-100/30 text-xs font-bold text-slate-700 dark:text-gray-300 transition-colors shadow-sm cursor-pointer select-none"
              >
                {allSelected ? (
                  <Check className="w-4 h-4 text-amber-700 font-bold" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>Chọn tất cả hiển thị</span>
              </button>
              
              <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 font-mono">
                Đã chọn: <span className="font-bold text-amber-900 dark:text-amber-400 font-mono">{selectedCount}</span> / {bookmarks.length}
              </span>
            </div>

            {/* Right: Search, category filter and export controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full sm:w-36 pl-8 pr-4 py-2.5 rounded-xl border border-amber-150/30 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-700 dark:text-gray-200 cursor-pointer appearance-none shadow-sm"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'Tất cả danh mục' : cat}
                    </option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-700" />
              </div>

              {/* Input for searching bookmarks */}
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-700" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo tên sản vật, địa danh..."
                  className="w-full sm:w-48 pl-9 pr-3.5 py-2.5 rounded-xl border border-amber-150/30 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-800 dark:text-gray-100 shadow-sm"
                />
              </div>

              {/* Action Buttons trigger */}
              <BatchExportPDFButton 
                bookmarks={selectedBookmarks} 
                onCloseSelector={() => setIsExpanded(false)}
              />
            </div>
            
          </div>

          {/* Table List of Bookmarks checklist */}
          <div className="max-h-72 overflow-y-auto divide-y divide-amber-100/10 dark:divide-gray-800 border border-amber-150/15 dark:border-gray-850 rounded-2xl bg-white dark:bg-gray-950/40">
            {filteredBookmarks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-gray-500 text-xs font-medium space-y-1">
                <p>Không tìm thấy di sản hay bản ghi nào khớp với điều kiện lọc.</p>
                <p className="text-[10px] text-amber-700/65">Thử đổi từ khóa hoặc bộ lọc danh mục.</p>
              </div>
            ) : (
              filteredBookmarks.map((bookmark) => {
                const isChecked = selectedIds.has(bookmark.id);
                return (
                  <div
                    key={bookmark.id}
                    onClick={(e) => toggleSelect(bookmark.id, e)}
                    className={cn(
                      'flex items-center justify-between gap-4 px-4 py-3 hover:bg-[#FAF7F2]/50 dark:hover:bg-gray-850/50 cursor-pointer transition-colors select-none',
                      isChecked && 'bg-amber-50/10 dark:bg-amber-950/5'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Interactive check badge */}
                      <div className="flex-shrink-0 cursor-pointer p-0.5 rounded hover:bg-amber-100">
                        {isChecked ? (
                          <Check className="w-4 h-4 text-amber-700" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-350" />
                        )}
                      </div>
                      
                      {/* Image Thumbnail */}
                      {(bookmark.restoredImage || bookmark.imageUrl) && (
                        <div className="w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-amber-100/20 shadow-sm">
                          <img
                            src={bookmark.restoredImage || bookmark.imageUrl || ''}
                            alt={bookmark.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* Title description meta */}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {bookmark.title}
                        </p>
                        <p className="text-[10px] text-slate-450 dark:text-gray-450 truncate font-mono uppercase tracking-wider font-semibold">
                          {bookmark.category || 'Mảng Khảo cứu'} {bookmark.year ? `• Thời đại: ${bookmark.year > 0 ? `Năm ${bookmark.year}` : `${Math.abs(bookmark.year)} TCN`}` : ''}
                          {bookmark.isAIRestored && ' • ✨ Phục hồi AI'}
                        </p>
                      </div>
                    </div>

                    {/* Metadata badge tags */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {bookmark.rating && (
                        <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-md">
                          {bookmark.rating} ⭐
                        </span>
                      )}
                      {bookmark.tags && bookmark.tags.length > 0 && (
                        <span className="text-[9px] font-mono text-slate-450 hidden sm:inline-block bg-slate-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500">
                          #{bookmark.tags[0]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
