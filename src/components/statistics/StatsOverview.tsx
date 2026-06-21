'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Bookmark, Sparkles, FileText, Star } from 'lucide-react';
import { cn } from '@/utils';

interface StatsOverviewProps {
  total: number;
  aiRestored: number;
  withNotes: number;
  averageRating: number;
  className?: string;
}

export function StatsOverview({
  total,
  aiRestored,
  withNotes,
  averageRating,
  className,
}: StatsOverviewProps) {
  const stats = [
    {
      label: 'Tổng di sản',
      value: total,
      icon: Bookmark,
      color: 'bg-amber-600 text-white',
    },
    {
      label: 'Phục hồi bằng AI',
      value: aiRestored,
      icon: Sparkles,
      color: 'bg-purple-600 text-white',
      sub: total > 0 ? `${Math.round((aiRestored / total) * 100)}%` : undefined,
    },
    {
      label: 'Có ghi chú',
      value: withNotes,
      icon: FileText,
      color: 'bg-teal-600 text-white',
      sub: total > 0 ? `${Math.round((withNotes / total) * 100)}%` : undefined,
    },
    {
      label: 'Đánh giá trung bình',
      value: averageRating > 0 ? averageRating.toFixed(1) : 'Chưa có',
      icon: Star,
      color: 'bg-pink-600 text-white',
      sub: averageRating > 0 ? '⭐'.repeat(Math.round(averageRating)) : undefined,
    },
  ];

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-4 gap-4', className)}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-amber-100/10 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-gray-400 font-mono uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 font-mono">
                {stat.value}
              </p>
              {stat.sub && (
                <p className="text-[10px] text-amber-800 dark:text-amber-400 mt-1 font-medium font-mono bg-amber-500/10 dark:bg-amber-500/20 px-1.5 py-0.5 rounded w-max">
                  {stat.sub}
                </p>
              )}
            </div>
            <div className={cn('p-2.5 rounded-xl shrink-0', stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
