'use client';

import { Users, FileCheck, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import type { StudentStatCardItem } from '@/types/student';

// Mini sparkline data (up or down trend)
const sparklineUp = [20, 30, 25, 45, 55, 50, 70];
const sparklineDown = [70, 60, 55, 45, 40, 35, 25];

interface StudentStatCardProps {
  data: StudentStatCardItem;
}

const iconMap = {
  users: Users,
  completed: FileCheck,
  incomplete: XCircle,
};

export default function StudentStatCard({ data }: StudentStatCardProps) {
  const Icon = iconMap[data.icon];
  const trendColor = data.trendUp ? '#10B981' : '#EF4444';
  const sparkline = data.trendUp ? sparklineUp : sparklineDown;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
            <Icon className="h-6 w-6" />
          </div>
          <div
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-base font-semibold"
            style={{ color: trendColor, backgroundColor: `${trendColor}15` }}
          >
            {data.trendUp ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            {data.trendPercent}%
          </div>
        </div>
        <p className="mt-5 text-base font-semibold uppercase tracking-wide text-gray-700">
          {data.title}
        </p>
        <p className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900">
          {data.value.toLocaleString('vi-VN')}
        </p>
      </div>
      {/* Background sparkline */}
      <div
        className="absolute bottom-0 right-0 h-16 w-24 opacity-20"
        aria-hidden
      >
        <svg
          viewBox="0 0 80 40"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <polyline
            fill="none"
            stroke={data.trendUp ? '#10B981' : '#EF4444'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={sparkline
              .map((y, i) => `${(i / (sparkline.length - 1)) * 80},${40 - (y / 70) * 36}`)
              .join(' ')}
          />
        </svg>
      </div>
    </div>
  );
}
