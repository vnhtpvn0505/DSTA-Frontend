'use client'

import { cn } from '@/lib/utils'

interface ExamQuestionNavProps {
  total: number
  current: number
  answeredSet: Set<number>
  flaggedSet: Set<number>
  onSelect: (index: number) => void
  onSubmit: () => void
}

export default function ExamQuestionNav({
  total,
  current,
  answeredSet,
  flaggedSet: _flaggedSet,
  onSelect,
  onSubmit,
}: ExamQuestionNavProps) {
  const cols = 5

  return (
    <aside className="flex h-full w-[200px] shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="px-4 pt-6 pb-4">
        <h3 className="text-sm font-bold text-gray-900">Danh sách câu hỏi</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: total }, (_, i) => {
            const isCurrent = i === current
            const isAnswered = answeredSet.has(i)

            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelect(i)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors cursor-pointer',
                  isCurrent && 'bg-emerald-500 text-white ring-2 ring-emerald-600 ring-offset-2',
                  isAnswered && !isCurrent && 'bg-blue-100 text-blue-800 border border-blue-200',
                  !isCurrent && !isAnswered && 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200',
                )}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      </div>

      <div className="shrink-0 border-t border-gray-200 p-4">
        <button
          type="button"
          onClick={onSubmit}
          className="w-full rounded-xl bg-sky-100 py-3 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-200 cursor-pointer"
        >
          Nộp bài thi
        </button>
      </div>
    </aside>
  )
}
