'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'motion/react';
import { cn } from '@/utils';

const COLORS = [
  '#b45309', // Amber-700
  '#d97706', // Amber-600
  '#0f766e', // Teal-700
  '#1d4ed8', // Blue-700
  '#6b21a8', // Purple-800
  '#be185d', // Pink-700
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#f97316', // Orange
];

interface CategoryChartProps {
  data: { name: string; count: number }[];
  className?: string;
}

export function CategoryChart({ data, className }: CategoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 dark:text-gray-500 font-mono text-xs">
        Chưa có dữ liệu phân bổ danh mục
      </div>
    );
  }

  // Double check that there's at least some data points
  const totalCount = data.reduce((acc, curr) => acc + curr.count, 0);
  if (totalCount === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 dark:text-gray-500 font-mono text-xs">
        Chưa có dữ liệu phân bổ danh mục
      </div>
    );
  }

  // Custom tooltips for nice styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-gray-900/95 border border-amber-100 dark:border-gray-800 p-2.5 rounded-xl shadow-lg font-mono text-xs">
          <p className="font-semibold text-slate-900 dark:text-white mb-1">{payload[0].name}</p>
          <p className="text-amber-800 dark:text-amber-400 font-bold">
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
      className={cn('w-full h-72 sm:h-80', className)}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={({ name, percent }) =>
              percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
            }
            outerRadius={90}
            innerRadius={45}
            paddingAngle={3}
            dataKey="count"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
