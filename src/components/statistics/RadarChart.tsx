'use client';

import React from 'react';
import { 
  Radar, 
  RadarChart as RechartsRadar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../../../utils';

interface RadarChartProps {
  data: { name: string; count: number; avgRating?: number; aiCount?: number }[];
  className?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const title = payload[0]?.payload?.subject || '';
    return (
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-4 rounded-2xl border border-amber-200/40 dark:border-gray-800 shadow-xl text-xs space-y-1.5 min-w-[160px]">
        <p className="font-bold text-amber-950 dark:text-amber-100 mb-1 border-b border-amber-100/30 pb-1">
          {title}
        </p>
        {payload.map((p: any) => {
          let valueStr = `${p.value}`;
          if (p.name === 'Số lượng') valueStr = `${p.value} hiện vật`;
          else if (p.name === 'Đánh giá TB') valueStr = `${Number(p.value).toFixed(1)}⭐`;
          else if (p.name === 'Tỷ lệ AI') valueStr = `${(p.value * 100).toFixed(0)}%`;
          
          return (
            <div key={p.name} className="flex items-center justify-between gap-4">
              <span className="text-slate-500 dark:text-gray-400 font-medium">{p.name}:</span>
              <span className="font-bold font-mono text-amber-900 dark:text-amber-400">{valueStr}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export function RadarChart({ data, className }: RadarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-72 text-slate-400 dark:text-gray-500 font-medium text-xs">
        Không đủ dữ liệu để vẽ radar
      </div>
    );
  }

  // Chuẩn bị dữ liệu cho radar: chỉ lấy các danh mục có từ 1 item trở lên
  const chartData = data
    .filter((d) => d.count > 0)
    .map((d) => ({
      subject: d.name,
      'Số lượng': d.count,
      'Đánh giá TB': d.avgRating || 0,
      'Tỷ lệ AI': d.count > 0 ? (d.aiCount || 0) / d.count : 0,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-72 text-slate-400 dark:text-gray-500 font-medium text-xs">
        Chưa có dữ liệu danh mục hợp lệ
      </div>
    );
  }

  // Điều chỉnh giá trị max để hiển thị đẹp
  const maxCount = Math.max(...chartData.map((d) => d['Số lượng']), 1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn('w-full h-80 flex items-center justify-center', className)}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <RechartsRadar data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid stroke="rgba(180, 83, 9, 0.15)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#451a03', fontSize: 11, fontWeight: 500 }} 
            className="dark:fill-amber-100 fill-amber-950 font-display"
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, maxCount * 1.5]} 
            tick={{ fill: '#78350f', fontSize: 9 }}
            className="dark:fill-amber-400 fill-amber-800"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value) => <span className="text-xs font-mono font-medium text-amber-900 dark:text-amber-200">{value}</span>}
          />
          <Radar
            name="Số lượng"
            dataKey="Số lượng"
            stroke="#b45309"
            fill="#b45309"
            fillOpacity={0.25}
          />
          <Radar
            name="Đánh giá TB"
            dataKey="Đánh giá TB"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.15}
          />
          <Radar
            name="Tỷ lệ AI"
            dataKey="Tỷ lệ AI"
            stroke="#9333ea"
            fill="#9333ea"
            fillOpacity={0.15}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </motion.div>
  );
}
