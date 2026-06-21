'use client';

import React, { useState } from 'react';
import { cn } from '@/utils';
import { Bell, BellOff, Calendar, Clock, X, Check, Pencil } from 'lucide-react';
import { toast } from '@/src/components/ui/Toaster';

interface ReminderEditorProps {
  id: string;
  initialReminder?: {
    date: string;
    note?: string;
    completed?: boolean;
  } | null;
  onSave: (id: string, reminder: any | null) => void;
  className?: string;
}

export function ReminderEditor({ id, initialReminder, onSave, className }: ReminderEditorProps) {
  const [isSetting, setIsSetting] = useState(!!initialReminder);
  const [date, setDate] = useState(initialReminder?.date ? initialReminder.date.slice(0, 16) : '');
  const [note, setNote] = useState(initialReminder?.note || '');
  const [isExpanded, setIsExpanded] = useState(false);

  const hasReminder = !!initialReminder;

  const handleSave = () => {
    if (!date) {
      toast.error('Vui lòng chọn thời gian nhắc nhở');
      return;
    }
    const reminder = {
      date: new Date(date).toISOString(),
      note: note.trim() || undefined,
      completed: false,
    };
    onSave(id, reminder);
    toast.success('Đã đặt nhắc nhở thành công ⏰');
    setIsSetting(true);
    setIsExpanded(false);
  };

  const handleRemove = () => {
    onSave(id, null);
    setIsSetting(false);
    setIsExpanded(false);
    setDate('');
    setNote('');
    toast.info('Đã hủy nhắc nhở');
  };

  const handleComplete = () => {
    if (initialReminder) {
      const updated = {
        ...initialReminder,
        completed: !initialReminder.completed,
      };
      onSave(id, updated);
      toast.success(updated.completed ? 'Đã đánh dấu hoàn thành! ✅' : 'Đã chuyển về trạng thái chờ ⏳');
    }
  };

  // Kiểm tra quá hạn
  const isOverdue = initialReminder?.date && new Date(initialReminder.date) <= new Date() && !initialReminder.completed;

  return (
    <div className={cn('space-y-3 bg-[#FAF7F2] dark:bg-gray-850 p-5 rounded-2xl border border-amber-100/50', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-amber-950 dark:text-amber-250">
          <Bell className={cn('w-4 h-4', hasReminder && !initialReminder?.completed ? 'text-amber-600 animate-swing' : 'text-slate-400')} />
          <span className="font-semibold">Nhắc nhở nghiên cứu</span>
          {hasReminder && (
            <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-full font-mono">
              Đang hoạt động
            </span>
          )}
        </div>
        {!isSetting ? (
          <button
            onClick={() => {
              setIsSetting(true);
              setIsExpanded(true);
            }}
            className="text-sm font-semibold text-amber-850 dark:text-amber-400 hover:text-amber-955 dark:hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            Lên lịch nhắc
          </button>
        ) : hasReminder && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleComplete}
              className={cn(
                'text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer',
                initialReminder?.completed
                  ? 'bg-green-550/10 text-green-700 dark:text-green-400 border-green-551/20'
                  : 'bg-white dark:bg-gray-900 text-slate-600 dark:text-gray-400 border-slate-200 hover:bg-slate-50'
              )}
            >
              <Check className="w-3 h-3" />
              {initialReminder?.completed ? 'Đã xong' : 'Xong'}
            </button>
            <button
              onClick={() => {
                setIsExpanded(!isExpanded);
                if (initialReminder?.date) setDate(initialReminder.date.slice(0, 16));
                if (initialReminder?.note) setNote(initialReminder.note);
              }}
              className="text-xs font-semibold text-amber-800 dark:text-amber-400 hover:text-amber-950 transition-colors cursor-pointer"
            >
              Sửa
            </button>
            <button
              onClick={handleRemove}
              className="text-xs font-semibold text-red-650 dark:text-red-400 hover:text-red-800 transition-colors cursor-pointer"
              title="Xóa nhắc nhở"
            >
              <BellOff className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {isSetting && (!hasReminder || isExpanded) ? (
        <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-amber-200/20 dark:border-gray-800 space-y-3 shadow-inner">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-amber-900/80 dark:text-amber-200 font-mono font-bold uppercase tracking-wider block mb-1">Thời gian nhắc (*)</label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-amber-200/40 dark:border-gray-700 bg-white dark:bg-gray-950 text-slate-800 dark:text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-amber-900/80 dark:text-amber-200 font-mono font-bold uppercase tracking-wider block mb-1">Mục tiêu nghiên cứu</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Gợi nhớ việc cần làm, ví giụ: Đối chiếu thư mục viện nghiên cứu..."
                className="w-full px-3 py-2 rounded-lg border border-amber-200/40 dark:border-gray-700 bg-white dark:bg-gray-950 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => {
                if (!hasReminder) {
                  setIsSetting(false);
                } else {
                  setIsExpanded(false);
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 rounded-lg text-xs bg-amber-950 hover:bg-amber-900 text-amber-200 font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3 h-3" />
              Lưu lịch nhắc
            </button>
          </div>
        </div>
      ) : hasReminder && !isExpanded ? (
        <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Calendar className="w-3.5 h-3.5 text-amber-755 dark:text-amber-400" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {new Date(initialReminder.date).toLocaleString('vi-VN', {
                  weekday: 'short',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {isOverdue && (
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-red-700 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full border border-red-200/30">
                  Đã quá hạn ⚠️
                </span>
              )}
              {initialReminder.completed && (
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-green-700 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full border border-green-200/30">
                  Đã hoàn thành ✨
                </span>
              )}
            </div>
            {initialReminder.note && (
              <p className="text-xs text-slate-500 dark:text-gray-400 italic pl-5">
                📝 {initialReminder.note}
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
