'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, ChevronDown } from 'lucide-react';
import { cn } from '../../../utils';

interface DateRangeFilterProps {
  onRangeChange: (range: { startDate?: Date; endDate?: Date }) => void;
  className?: string;
}

type Preset = 'week' | 'month' | 'year' | 'all';

export function DateRangeFilter({ onRangeChange, className }: DateRangeFilterProps) {
  const [selectedPreset, setSelectedPreset] = useState<Preset>('all');
  const [isOpen, setIsOpen] = useState(false);

  const presets: { label: string; value: Preset; getRange: () => { startDate?: Date; endDate?: Date } }[] = [
    {
      label: 'Tuần này',
      value: 'week',
      getRange: () => {
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - 7);
        return { startDate: start, endDate: now };
      },
    },
    {
      label: 'Tháng này',
      value: 'month',
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return { startDate: start, endDate: now };
      },
    },
    {
      label: 'Năm này',
      value: 'year',
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        return { startDate: start, endDate: now };
      },
    },
    {
      label: 'Tất cả',
      value: 'all',
      getRange: () => ({ startDate: undefined, endDate: undefined }),
    },
  ];

  const handlePresetSelect = (preset: Preset) => {
    setSelectedPreset(preset);
    const range = presets.find((p) => p.value === preset)?.getRange() || {};
    onRangeChange(range);
    setIsOpen(false);
  };

  const currentLabel = presets.find((p) => p.value === selectedPreset)?.label || 'Tất cả';

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-amber-200/50 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 transition-colors text-xs font-semibold text-amber-950 dark:text-gray-100 shadow-sm cursor-pointer"
      >
        <Calendar className="w-4 h-4 text-amber-600" />
        <span>Thời gian: {currentLabel}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform text-amber-600', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-20 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-amber-100/30 dark:border-gray-800 p-2 min-w-[180px]"
            >
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePresetSelect(preset.value)}
                  className={cn(
                    'w-full text-left px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer',
                    selectedPreset === preset.value
                      ? 'bg-amber-100/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 font-bold'
                      : 'hover:bg-[#FAF7F2] dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
