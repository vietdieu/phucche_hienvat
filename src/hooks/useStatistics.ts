import { useMemo } from 'react';
import { BookmarkItem } from '../types';

export interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

export interface Statistics {
  total: number;
  aiRestored: number;
  withNotes: number;
  categories: { name: string; count: number; avgRating?: number; aiCount?: number }[];
  timeline: { month: string; count: number }[];
  aiConfidence: { range: string; count: number }[];
  averageRating: number;
  filteredCount: number;
}

// Helper: Kiểm tra ngày tháng hợp lệ
function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

export function useStatistics(bookmarks: BookmarkItem[], dateRange?: DateRange): Statistics {
  const startVal = dateRange?.startDate ? new Date(dateRange.startDate).getTime() : undefined;
  const endVal = dateRange?.endDate ? new Date(dateRange.endDate).getTime() : undefined;

  return useMemo(() => {
    // Lọc theo thời gian
    let filtered = bookmarks || [];
    
    if (startVal) {
      filtered = filtered.filter((b) => {
        if (!b.createdAt) return false;
        const date = new Date(b.createdAt);
        return isValidDate(date) && date.getTime() >= startVal;
      });
    }
    
    if (endVal) {
      filtered = filtered.filter((b) => {
        if (!b.createdAt) return false;
        const date = new Date(b.createdAt);
        return isValidDate(date) && date.getTime() <= endVal;
      });
    }

    if (!filtered || filtered.length === 0) {
      return {
        total: 0,
        aiRestored: 0,
        withNotes: 0,
        categories: [],
        timeline: [],
        aiConfidence: [],
        averageRating: 0,
        filteredCount: bookmarks ? bookmarks.length : 0,
      };
    }

    const total = filtered.length;
    const aiRestored = filtered.filter((b) => b.isAIRestored).length;
    const withNotes = filtered.filter((b) => b.note && b.note.trim().length > 0).length;

    // Danh mục (có thêm avgRating và aiCount để dùng phục vụ radar)
    const categoryMap = new Map<string, { count: number; totalRating: number; aiCount: number }>();
    filtered.forEach((b) => {
      const cat = b.category || 'Khác';
      const existing = categoryMap.get(cat) || { count: 0, totalRating: 0, aiCount: 0 };
      categoryMap.set(cat, {
        count: existing.count + 1,
        totalRating: existing.totalRating + (b.rating || 0),
        aiCount: existing.aiCount + (b.isAIRestored ? 1 : 0),
      });
    });
    
    const categories = Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      avgRating: data.count > 0 ? data.totalRating / data.count : 0,
      aiCount: data.aiCount,
    })).sort((a, b) => b.count - a.count);

    // Timeline - Nhóm theo tháng
    const monthMap = new Map<string, number>();
    filtered.forEach((b) => {
      let monthName = 'Chưa rõ';
      try {
        if (b.createdAt) {
          const date = new Date(b.createdAt);
          if (isValidDate(date)) {
            monthName = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
          }
        }
      } catch {
        // Fallback
      }
      monthMap.set(monthName, (monthMap.get(monthName) || 0) + 1);
    });
    
    const timeline = Array.from(monthMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => {
        if (a.month === 'Chưa rõ') return 1;
        if (b.month === 'Chưa rõ') return -1;
        try {
          const [monthA, yearA] = a.month.split('/').map(Number);
          const [monthB, yearB] = b.month.split('/').map(Number);
          return yearA !== yearB ? yearA - yearB : monthA - monthB;
        } catch {
          return a.month.localeCompare(b.month);
        }
      });

    // AI Confidence
    const aiItems = filtered.filter((b) => b.isAIRestored && b.recognition?.confidence);
    const confidenceRanges = [
      { range: '0-20%', min: 0, max: 0.2 },
      { range: '20-40%', min: 0.2, max: 0.4 },
      { range: '40-60%', min: 0.4, max: 0.6 },
      { range: '60-80%', min: 0.6, max: 0.8 },
      { range: '80-100%', min: 0.8, max: 1.05 },
    ];
    const aiConfidence = confidenceRanges.map(({ range, min, max }) => ({
      range,
      count: aiItems.filter(
        (b) => b.recognition!.confidence >= min && b.recognition!.confidence < max
      ).length,
    }));

    const ratedItems = filtered.filter((b) => b.rating);
    const averageRating = ratedItems.length > 0
      ? ratedItems.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedItems.length
      : 0;

    return {
      total,
      aiRestored,
      withNotes,
      categories,
      timeline,
      aiConfidence,
      averageRating,
      filteredCount: bookmarks ? bookmarks.length : 0,
    };
  }, [bookmarks, startVal, endVal]);
}
