'use client';

import React from 'react';
import { useTheme } from '@/src/context/ThemeContext';
import { cn } from '@/utils';

interface ItemGridProps {
  items: any[];
  children: (item: any) => React.ReactNode;
}

export function ItemGrid({ items, children }: ItemGridProps) {
  const { layout } = useTheme();

  const gridClasses = {
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
    list: 'flex flex-col gap-4 max-w-4xl mx-auto',
    compact: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4',
    timeline: 'flex flex-col gap-6 relative max-w-4xl mx-auto',
    masonry: 'columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6',
  };

  if (layout === 'masonry') {
    return (
      <div className={cn(gridClasses.masonry)}>
        {items.map((item) => (
          <div key={item.id || item.title} className="break-inside-avoid pb-6">
            {children(item)}
          </div>
        ))}
      </div>
    );
  }

  if (layout === 'timeline') {
    return (
      <div className={cn('relative pl-2 sm:pl-6', gridClasses.timeline)}>
        {/* Timeline main line */}
        <div className="absolute left-[21px] sm:left-[37px] top-2 bottom-8 w-0.5 bg-amber-500/20 dark:bg-amber-500/10 pointer-events-none" />

        {items.map((item, index) => (
          <div key={item.id || item.title} className="relative pl-10 sm:pl-14">
            <div className="absolute left-0 top-1.5 sm:top-2.5 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-slate-900 border-2 border-primary text-white flex items-center justify-center text-xs sm:text-sm font-bold z-10 shadow-md">
              {index + 1}
            </div>
            {children(item)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(gridClasses[layout] || gridClasses.grid)}>
      {items.map((item) => (
        <React.Fragment key={item.id || item.title}>
          {children(item)}
        </React.Fragment>
      ))}
    </div>
  );
}
