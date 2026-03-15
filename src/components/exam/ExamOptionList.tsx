'use client'

import { cn } from '@/lib/utils'
import type { ExamOption } from '@/types/exam'

interface ExamOptionListProps {
  options: ExamOption[]
  selectedOptionId: number | null
  onSelect: (optionId: number) => void
}

export default function ExamOptionList({
  options,
  selectedOptionId,
  onSelect,
}: ExamOptionListProps) {
  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isSelected = selectedOptionId === option.id
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={cn(
              'flex w-full cursor-pointer items-center gap-4 rounded-xl border-2 bg-white px-5 py-4 text-left transition-all',
              isSelected
                ? 'border-[#00284D] bg-blue-50/50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50',
            )}
          >
            <div
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                isSelected
                  ? 'border-[#00284D] bg-[#00284D]'
                  : 'border-gray-300 bg-white',
              )}
            >
              {isSelected && (
                <span className="h-2 w-2 rounded-full bg-white" />
              )}
            </div>
            <span
              className={cn(
                'text-sm leading-relaxed',
                isSelected ? 'font-medium text-gray-900' : 'text-gray-700',
              )}
            >
              {option.optionText}
            </span>
          </button>
        )
      })}
    </div>
  )
}
