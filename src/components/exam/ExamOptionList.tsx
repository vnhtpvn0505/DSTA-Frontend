'use client'

import { Check } from 'lucide-react'
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
            className={`flex w-full cursor-pointer items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all ${
              isSelected
                ? 'border-main bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                isSelected
                  ? 'border-main bg-main text-white'
                  : 'border-gray-300 bg-white'
              }`}
            >
              {isSelected && <Check className="h-3.5 w-3.5" />}
            </div>
            <span
              className={`text-sm leading-relaxed ${
                isSelected ? 'font-medium text-gray-900' : 'text-gray-700'
              }`}
            >
              {option.optionText}
            </span>
          </button>
        )
      })}
    </div>
  )
}
