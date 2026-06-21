'use client';

import React, { useState, useRef } from 'react';
import { useBookmarks } from '../../context/BookmarksContext';
import { useStatistics, DateRange } from '../../hooks/useStatistics';
import { StatsOverview } from './StatsOverview';
import { CategoryChart } from './CategoryChart';
import { TimelineChart } from './TimelineChart';
import { AIConfidenceChart } from './AIConfidenceChart';
import { RadarChart } from './RadarChart';
import { DateRangeFilter } from './DateRangeFilter';
import { ExportChartImage } from './ExportChartImage';
import { EmptyState } from '../ui/EmptyState';
import { motion } from 'motion/react';
import { BarChart3 } from 'lucide-react';

export function StatisticsDashboard() {
  const { bookmarks } = useBookmarks();
  const [dateRange, setDateRange] = useState<DateRange>({});
  const stats = useStatistics(bookmarks, dateRange);

  // Refs để xuất ảnh từng biểu đồ
  const categoryRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);
  const radarRef = useRef<HTMLDivElement>(null);

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <EmptyState
          title="Chưa có dữ liệu thống kê"
          description="Bắt đầu lưu các bookmark di sản và thực hiện phục hồi để xem phân tích số liệu chi tiết."
          action={{
            label: 'Khám phá ngay',
            href: '/',
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header with Date Range Filter */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b border-amber-200/20 pb-5"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-700 rounded-2xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-medium text-amber-950 dark:text-[#FBFBF9]">
                📊 Thống Kê Bộ Sưu Tập
              </h1>
              <p className="text-xs font-mono text-amber-800 dark:text-amber-400 mt-1 uppercase tracking-wider">
                {stats.filteredCount > 0 && stats.total !== stats.filteredCount
                  ? `Hiển thị ${stats.total} trên tổng số ${stats.filteredCount} hiện vật`
                  : `Phân tích số liệu và độ tin cậy phục hồi lưu trữ di sản (${bookmarks.length} hiện vật)`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DateRangeFilter onRangeChange={setDateRange} />
          </div>
        </div>
      </motion.div>

      {/* Stats Cards Overview */}
      <StatsOverview
        total={stats.total}
        aiRestored={stats.aiRestored}
        withNotes={stats.withNotes}
        averageRating={stats.averageRating}
      />

      {/* Category Chart card with image export */}
      <div 
        ref={categoryRef} 
        id="category-chart-card" 
        className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-amber-100/10 dark:border-gray-800 shadow-sm relative flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-4 border-b border-amber-50/20 pb-3">
          <div>
            <h3 className="text-sm uppercase font-mono font-bold text-amber-950 dark:text-amber-200 tracking-wider flex items-center gap-2">
              🏛️ Phân bố theo danh mục di sản
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-gray-400 mt-1 leading-relaxed">
              Tần suất lưu trữ hiện vật được chia theo phân vùng văn hóa lịch sử, kiến trúc, cổ vật, hoặc đời sống xã hội.
            </p>
          </div>
          <ExportChartImage chartRef={categoryRef} filename="phan_bo_danh_muc" />
        </div>
        <CategoryChart data={stats.categories} />
      </div>

      {/* Dynamic 2-columns grid: Timeline & Radar compares */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar: Timeline with export */}
        <div 
          ref={timelineRef} 
          id="timeline-chart-card" 
          className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-amber-100/10 dark:border-gray-800 shadow-sm relative flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4 border-b border-amber-50/20 pb-3">
            <div>
              <h3 className="text-sm uppercase font-mono font-bold text-amber-950 dark:text-amber-200 tracking-wider flex items-center gap-2">
                📅 Tần suất lưu trữ theo thời gian
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-gray-400 mt-1 leading-relaxed">
                Tiến độ tích lũy và nghiên cứu bảo tồn tài liệu số hóa di sản văn hóa qua các tháng.
              </p>
            </div>
            <ExportChartImage chartRef={timelineRef} filename="tan_suat_thoi_gian" />
          </div>
          <TimelineChart data={stats.timeline} />
        </div>

        {/* Radar: Category Metrics compare with export */}
        <div 
          ref={radarRef} 
          id="radar-chart-card" 
          className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-amber-100/10 dark:border-gray-800 shadow-sm relative flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4 border-b border-amber-50/20 pb-3">
            <div>
              <h3 className="text-sm uppercase font-mono font-bold text-amber-950 dark:text-amber-200 tracking-wider flex items-center gap-2">
                🎯 Thống kê đa chiều qua Radar
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-gray-400 mt-1 leading-relaxed">
                Đánh giá tổng hợp tỉ lệ hiện vật phục chế bằng AI, điểm đánh giá trung bình và số lượng của từng danh mục.
              </p>
            </div>
            <ExportChartImage chartRef={radarRef} filename="so_sanh_radar_danh_muc" />
          </div>
          <RadarChart data={stats.categories} />
        </div>
      </div>

      {/* Extra chart: AI confidence analysis with export */}
      <div 
        ref={aiRef} 
        id="ai-confidence-chart-card" 
        className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-amber-100/10 dark:border-gray-800 shadow-sm relative"
      >
        <div className="flex items-center justify-between mb-4 border-b border-amber-50/20 pb-3">
          <div>
            <h3 className="text-sm uppercase font-mono font-bold text-amber-950 dark:text-amber-200 tracking-wider flex items-center gap-2">
              🤖 Đánh giá mức tin cậy từ phục chế AI
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-gray-400 mt-1 leading-relaxed">
              Tỷ lệ và độ tin cậy (Confidence Score) từ Generative Vision Model khi nhận diện thông tin niên đại, chất liệu, và giá trị hiện vật.
            </p>
          </div>
          <ExportChartImage chartRef={aiRef} filename="tin_cay_phuc_che_ai" />
        </div>
        <AIConfidenceChart data={stats.aiConfidence} />
        {stats.aiRestored > 0 && (
          <p className="text-[10px] font-semibold text-slate-500 font-mono mt-4 text-center">
            Dựa trên phân tích từ {stats.aiRestored} hiện vật đã phục chế hoàn tất bằng AI
          </p>
        )}
      </div>
    </div>
  );
}
