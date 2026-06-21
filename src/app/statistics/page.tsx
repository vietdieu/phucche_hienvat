'use client';

import React from 'react';
import { StatisticsDashboard } from '../../components/statistics/StatisticsDashboard';

export default function StatisticsPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F5]/30 dark:from-gray-900 dark:to-gray-950 py-10">
      <div className="container mx-auto px-4">
        <StatisticsDashboard />
      </div>
    </div>
  );
}
