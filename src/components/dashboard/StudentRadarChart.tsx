'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'

export interface CompetencyDomain {
  domain: string
  shortLabel: string
  score: number
  maxScore: number
  color: string
}

interface StudentRadarChartProps {
  data: CompetencyDomain[]
}

const COLORS = [
  '#003562',
  '#0EA5E9',
  '#A855F7',
  '#F59E0B',
  '#EF4444',
  '#1E3A5F',
]

export default function StudentRadarChart({ data }: StudentRadarChartProps) {
  const chartData = data.map((d) => ({
    subject: d.shortLabel,
    score: d.score,
    fullMark: d.maxScore,
  }))

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-xl font-bold text-gray-900">
        Chi tiết Năng lực số
      </h3>

      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
        {/* Legend */}
        <div className="shrink-0 space-y-4 lg:w-[320px]">
          {data.map((item, i) => {
            const pct = Math.round((item.score / item.maxScore) * 100)
            return (
              <div key={item.shortLabel}>
                <p className="text-sm text-gray-700">
                  <span className="font-bold">Miền {i + 1}:</span>{' '}
                  {item.domain}
                </p>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: item.color || COLORS[i % COLORS.length],
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Radar */}
        <div className="mt-6 h-[320px] flex-1 lg:mt-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 10]}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickCount={6}
              />
              <Radar
                name="Năng lực"
                dataKey="score"
                stroke="#003562"
                fill="#003562"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
