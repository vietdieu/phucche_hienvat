'use client';

import React, { useMemo } from 'react';
import { BookmarkItem } from '@/src/types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { BarChart3, PieChartIcon, LayoutGrid, CheckCircle2, FileText, Sparkles } from 'lucide-react';

interface StatsDashboardProps {
  bookmarks: BookmarkItem[];
}

const COLORS = [
  '#b45309', // Amber-700
  '#d97706', // Amber-600
  '#0f766e', // Teal-700
  '#1d4ed8', // Blue-700
  '#6b21a8', // Purple-800
  '#be185d', // Pink-700
];

export function StatsDashboard({ bookmarks }: StatsDashboardProps) {
  // 1. Thống kê theo danh mục (Pie Chart)
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    bookmarks.forEach((b) => {
      const cat = b.category || 'Khác';
      stats[cat] = (stats[cat] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [bookmarks]);

  // 2. Thống kê theo thời gian (Bar Chart)
  const timeStats = useMemo(() => {
    const stats: Record<string, number> = {};
    bookmarks.forEach((b) => {
      try {
        const month = format(new Date(b.createdAt), 'MM/yyyy');
        stats[month] = (stats[month] || 0) + 1;
      } catch (err) {
        const fallbackMonth = format(new Date(), 'MM/yyyy');
        stats[fallbackMonth] = (stats[fallbackMonth] || 0) + 1;
      }
    });

    // Sắp xếp các tháng theo thứ tự thời gian tăng dần
    return Object.entries(stats)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => {
        const [monthA, yearA] = a.month.split('/').map(Number);
        const [monthB, yearB] = b.month.split('/').map(Number);
        return yearA !== yearB ? yearA - yearB : monthA - monthB;
      });
  }, [bookmarks]);

  // 3. Số lượng AI Restored
  const aiCount = useMemo(() => {
    return bookmarks.filter((b) => b.isAIRestored).length;
  }, [bookmarks]);

  // 4. Số lượng có ghi chú cá nhân
  const noteCount = useMemo(() => {
    return bookmarks.filter((b) => b.note && b.note.trim().length > 0).length;
  }, [bookmarks]);

  // 5. Số lượng nhắc nhở khảo cứu đang hoạt động
  const reminderCount = useMemo(() => {
    return bookmarks.filter((b) => b.reminder && !b.reminder.completed).length;
  }, [bookmarks]);

  if (!bookmarks || bookmarks.length === 0) {
    return null;
  }

  // Custom tooltips for nice styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-gray-900/95 border border-amber-250 dark:border-gray-700 p-3 rounded-xl shadow-lg font-mono text-xs">
          <p className="font-semibold text-slate-900 dark:text-white mb-1">{payload[0].name || payload[0].payload.month}</p>
          <p className="text-amber-800 dark:text-amber-400">
            Số lượng: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* 4 Quick Stat Summaries Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-gray-850 border border-amber-100/50 dark:border-gray-800 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300">
            <LayoutGrid className="w-5 h-5 text-amber-800 dark:text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-905 dark:text-white font-mono">{bookmarks.length}</div>
            <div className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider font-semibold font-mono">Di sản lưu trữ</div>
          </div>
        </div>

        {/* Card 2: AI Restored */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-gray-850 border border-amber-100/50 dark:border-gray-800 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300">
            <Sparkles className="w-5 h-5 text-amber-850 dark:text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-905 dark:text-white font-mono">{aiCount}</div>
            <div className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider font-semibold font-mono font-bold">Phục chế AI</div>
          </div>
        </div>

        {/* Card 3: Notes Created */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-gray-850 border border-amber-100/50 dark:border-gray-800 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300">
            <FileText className="w-5 h-5 text-amber-800 dark:text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-905 dark:text-white font-mono">{noteCount}</div>
            <div className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider font-semibold font-mono">Đã viết ghi chú</div>
          </div>
        </div>

        {/* Card 4: Active Reminders */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-gray-850 border border-amber-100/50 dark:border-gray-800 shadow-sm flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300">
            <CheckCircle2 className="w-5 h-5 text-green-700" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-905 dark:text-white font-mono">{reminderCount}</div>
            <div className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider font-semibold font-mono">Lịch nhắc nghiên cứu</div>
          </div>
        </div>

      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PieChart - Categories */}
        <div className="p-5 bg-white dark:bg-gray-900 rounded-3xl border border-amber-100/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <PieChartIcon className="w-4.5 h-4.5 text-amber-800 dark:text-amber-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Phân loại theo danh mục</h3>
            </div>
          </div>
          
          <div className="h-[220px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={categoryStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BarChart - Timing */}
        <div className="p-5 bg-white dark:bg-gray-900 rounded-3xl border border-amber-100/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <BarChart3 className="w-4.5 h-4.5 text-amber-800 dark:text-amber-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Số lượng theo thời gian lưu trữ</h3>
            </div>
          </div>

          <div className="h-[220px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={timeStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={{ stroke: '#f1f1f1' }}
                  tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: '#f1f1f1' }}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill="#b45309"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
