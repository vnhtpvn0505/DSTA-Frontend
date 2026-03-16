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

const COLS = 5
const CELL_SIZE = 36

export default function ExamQuestionNav({
  total,
  current,
  answeredSet,
  flaggedSet: _flaggedSet,
  onSelect,
  onSubmit,
}: ExamQuestionNavProps) {
  return (
    <aside className="flex h-full w-[244px] shrink-0 flex-col border-r border-gray-200 bg-gray-50">
      <div className="px-4 pt-6 pb-4">
        <h3 className="text-sm font-bold text-gray-900">Danh sách câu hỏi</h3>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-4">
        <div
          className="grid gap-2 w-full"
          style={{
            gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
            justifyContent: 'start',
          }}
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
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold transition-colors cursor-pointer',
                  isCurrent && 'bg-[#00284D] text-white',
                  isAnswered && !isCurrent && 'bg-emerald-500 text-white',
                  !isCurrent && !isAnswered &&
                    'bg-white text-gray-600 border border-gray-300 hover:border-gray-400',
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
          className="w-full rounded-lg border-2 border-sky-300 bg-sky-50 py-3 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-100 cursor-pointer"
        >
          Nộp bài thi
        </button>
      </div>
    </aside>
  )
}
