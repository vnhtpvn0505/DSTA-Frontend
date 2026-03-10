'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { ResultDistributionItem } from '@/types/dashboard';

interface ResultDonutChartProps {
  data: ResultDistributionItem[];
}

export default function ResultDonutChart({ data }: ResultDonutChartProps) {
  const chartData = data.map((d) => ({ ...d, name: d.name }));

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <h3 className="mb-6 text-lg font-semibold text-gray-900">
        Tỉ lệ kết quả
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={(props: { name?: string; percent?: number }) =>
                `${props.name ?? ''}: ${props.percent != null ? (props.percent * 100).toFixed(0) : ''}%`
              }
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value?: number, name?: string, props?: { payload?: { percent?: number } }) => [
                `${props?.payload?.percent != null ? props.payload.percent : value ?? 0}%`,
                name ?? '',
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => {
                const payload = entry?.payload as { percent?: number } | undefined;
                return (
                  <span className="text-sm text-gray-700">
                    {value} ({payload?.percent ?? ''}%)
                  </span>
                );
              }}
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ paddingTop: 16 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
