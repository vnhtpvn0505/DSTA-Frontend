'use client'

interface StudentStatsRowProps {
  highestScore: number
  maxScore: number
  currentLevel: string
  totalAttempts: number
}

export default function StudentStatsRow({
  highestScore,
  maxScore,
  currentLevel,
  totalAttempts,
}: StudentStatsRowProps) {
  const stats = [
    {
      label: 'Điểm số cao nhất',
      value: `${highestScore}/${maxScore}`,
    },
    {
      label: 'Xếp loại hiện tại',
      value: currentLevel,
    },
    {
      label: 'Số lần làm bài',
      value: String(totalAttempts),
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl bg-white p-6 shadow-sm"
        >
          <p className="text-sm font-medium text-gray-500">{stat.label}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  )
}
