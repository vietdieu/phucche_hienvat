'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { cn } from '@/utils';

interface AIConfidenceChartProps {
  data: { range: string; count: number }[];
  className?: string;
}

export function AIConfidenceChart({ data, className }: AIConfidenceChartProps) {
  const hasData = data && data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-60 text-slate-400 dark:text-gray-500 font-mono text-xs">
        Chưa có kết quả phân tích độ tin cậy từ phục chế AI
      </div>
    );
  }

  // Custom tooltips for nice styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-gray-900/95 border border-purple-100 dark:border-gray-800 p-2.5 rounded-xl shadow-lg font-mono text-xs">
          <p className="font-semibold text-slate-900 dark:text-white mb-1">Mức tin cậy: {payload[0].payload.range}</p>
          <p className="text-purple-800 dark:text-purple-400 font-bold">
            Số lượng: {payload[0].value} hiện vật
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn('w-full h-64 sm:h-72', className)}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-gray-800/50" />
          <XAxis 
            dataKey="range" 
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
          />
          <YAxis 
            allowDecimals={false}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="count" 
            fill="#8b5cf6" // Violet/Purple
            radius={[6, 6, 0, 0]} 
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
