'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { LevelDistributionItem } from '@/types/dashboard';

const BAR_FILL = '#00284D';

interface LevelBarChartProps {
  data: LevelDistributionItem[];
}

export default function LevelBarChart({ data }: LevelBarChartProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <h3 className="mb-6 text-lg font-semibold text-gray-900">
        So sánh sinh viên ở các bậc
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="level"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e5e7eb',
              }}
              formatter={(value: number | undefined) => [value ?? 0, 'Số sinh viên']}
              labelFormatter={(label) => label}
            />
            <Bar
              dataKey="count"
              fill={BAR_FILL}
              radius={[4, 4, 0, 0]}
              name="Số sinh viên"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
