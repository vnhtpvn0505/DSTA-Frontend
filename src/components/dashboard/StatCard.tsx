'use client';

import type { StatCardData } from '@/types/dashboard';

interface StatCardProps {
  data: StatCardData;
}

export default function StatCard({ data }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
      <p className="text-base font-semibold uppercase tracking-wide text-gray-700">
        {data.title}
      </p>
      <p className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900">
        {data.value.toLocaleString('vi-VN')}
      </p>
      <p className="mt-2 text-base font-medium" style={{ color: '#10B981' }}>
        {data.subtitle}
      </p>
    </div>
  );
}
