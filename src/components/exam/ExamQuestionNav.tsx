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
  flaggedSet,
  onSelect,
  onSubmit,
}: ExamQuestionNavProps) {
  const cols = 5

  return (
    <aside className="flex h-full w-[180px] shrink-0 flex-col bg-white shadow-md">
      <div className="px-4 pt-5 pb-3">
        <h3 className="text-sm font-bold text-gray-900">Danh sách câu hỏi</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: total }, (_, i) => {
            const isCurrent = i === current
            const isAnswered = answeredSet.has(i)
            const isFlagged = flaggedSet.has(i)

            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelect(i)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold transition-colors cursor-pointer',
                  isCurrent && 'ring-2 ring-main ring-offset-1',
                  isAnswered && !isCurrent && 'bg-green-500 text-white',
                  isFlagged && !isAnswered && 'bg-amber-400 text-white',
                  !isAnswered && !isCurrent && !isFlagged && 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  isCurrent && !isAnswered && 'bg-main text-white',
                  isCurrent && isAnswered && 'bg-green-600 text-white',
                )}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      </div>

      <div className="shrink-0 border-t border-gray-200 p-3">
        <button
          type="button"
          onClick={onSubmit}
          className="w-full rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 cursor-pointer"
        >
          Nộp bài thi
        </button>
      </div>
    </aside>
  )
}
