'use client';

import React from 'react';
import { BookmarkItem } from '@/src/types';
import { Sparkles, Calendar, MapPin, FileText } from 'lucide-react';
import { useTheme } from '@/src/context/ThemeContext';
import { cn } from '@/utils';

interface ItemCardProps {
  item: BookmarkItem;
}

export function ItemCard({ item }: ItemCardProps) {
  const { layout } = useTheme();

  const isList = layout === 'list';
  const isCompact = layout === 'compact';

  return (
    <div 
      className={cn(
        "group relative bg-[#FAF7F2] dark:bg-gray-800 rounded-2xl overflow-hidden border border-amber-200/50 hover:border-primary dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer flex",
        isList ? "flex-row items-stretch p-3.5 sm:p-5 gap-4 md:gap-6 min-h-[160px]" : "flex-col h-full"
      )}
    >
      {/* Badge Note */}
      {item.note && !isCompact && (
        <span className="absolute top-3 left-3 bg-slate-900/90 text-amber-200 text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full shadow-md z-10 uppercase flex items-center gap-1 border border-amber-700/25">
          <FileText className="w-2.5 h-2.5" />
          Ghi chú
        </span>
      )}

      {/* Badge AI */}
      {item.isAIRestored && !isCompact && (
        <span className="absolute top-3 right-3 bg-gradient-to-r from-primary to-primary-dark text-white text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full shadow-md z-10 uppercase flex items-center gap-1 border border-white/10">
          <Sparkles className="w-2.5 h-2.5" />
          AI Phục Chế
        </span>
      )}

      {/* Ảnh bìa */}
      <div 
        className={cn(
          "relative overflow-hidden bg-amber-955/20 shrink-0 select-none",
          isList 
            ? "w-28 h-28 sm:w-40 sm:h-40 rounded-xl my-auto shadow-sm border border-slate-200/20" 
            : "w-full aspect-[4/3] border-b border-amber-200/20",
          isCompact && "aspect-square"
        )}
      >
        <img
          src={item.imageUrl}
          alt={item.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        
        {item.category && !isCompact && (
          <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/60 text-amber-200 text-[10px] font-mono tracking-wider uppercase border border-white/10">
            {item.category}
          </span>
        )}

        {isCompact && item.isAIRestored && (
          <span className="absolute top-1.5 right-1.5 bg-primary p-1 rounded-full shadow-sm z-10" title="Đã phục chế bằng AI vạn năng">
            <Sparkles className="w-2.5 h-2.5 text-white" />
          </span>
        )}
      </div>

      {/* Thông tin hiện vật */}
      <div 
        className={cn(
          "flex-1 flex flex-col justify-between",
          isList ? "p-0" : isCompact ? "p-3 gap-1.5" : "p-5"
        )}
      >
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 
              className={cn(
                "font-semibold text-slate-900 dark:text-white line-clamp-1 transition-colors flex-1",
                isCompact ? "text-xs sm:text-sm font-display" : "text-base font-display group-hover:text-primary"
              )}
            >
              {item.title}
            </h3>
            {isCompact && item.category && (
              <span className="px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/5 text-slate-500 dark:text-amber-200 text-[8px] font-mono shrink-0 uppercase">
                {item.category}
              </span>
            )}
          </div>

          {!isCompact && (
            <p className="text-xs text-slate-505 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}

          {item.note && !isCompact && (
            <div className="text-[10px] sm:text-[11px] font-medium text-orange-800 dark:text-amber-400 flex items-center gap-1.5 mt-2 bg-amber-50/50 dark:bg-amber-950/20 px-2.5 py-1 rounded-xl border border-amber-200/20 w-fit max-w-full">
              <span className="shrink-0">📝</span>
              <span className="truncate max-w-[200px] font-mono">{item.note}</span>
            </div>
          )}
        </div>

        {/* Chân thẻ */}
        <div 
          className={cn(
            "flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-gray-400",
            isList ? "pt-3 border-t border-slate-100 dark:border-gray-800/60" : isCompact ? "pt-1.5 text-[10px]" : "pt-4 border-t border-amber-200/30"
          )}
        >
          {item.year ? (
            <span className="flex items-center gap-1 font-semibold text-primary/95">
              <Calendar className="w-3.5 h-3.5" />
              {item.year}
            </span>
          ) : (
            <span />
          )}

          {item.location && (
            <span 
              className={cn(
                "flex items-center gap-1 text-right truncate",
                isCompact ? "max-w-[80px]" : "max-w-[150px]"
              )} 
              title={item.location}
            >
              <MapPin className="w-3.5 h-3.5 text-red-500/80" />
              {item.location}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
