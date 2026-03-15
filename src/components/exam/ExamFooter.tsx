'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExamFooterProps {
  onPrevious: () => void
  onNext: () => void
  onClearCurrent?: () => void
  hasPrevious: boolean
  hasNext: boolean
  hasSelection?: boolean
}

export default function ExamFooter({
  onPrevious,
  onNext,
  onClearCurrent,
  hasPrevious,
  hasNext,
  hasSelection = false,
}: ExamFooterProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-t border-gray-200 bg-white px-6 py-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!hasPrevious}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl border border-[#00284D] bg-white px-5 py-2.5 text-sm font-semibold text-[#00284D] transition-colors cursor-pointer',
          !hasPrevious && 'cursor-not-allowed opacity-50',
          hasPrevious && 'hover:bg-[#00284D]/5',
        )}
      >
        <ChevronLeft className="h-5 w-5" />
        Quay lại
      </button>

      {onClearCurrent && (
        <button
          type="button"
          onClick={onClearCurrent}
          disabled={!hasSelection}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-amber-900 transition-colors cursor-pointer',
            !hasSelection && 'cursor-not-allowed opacity-50',
            hasSelection && 'hover:bg-amber-500',
          )}
        >
          Chỉnh sửa làm lại
        </button>
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl bg-[#00284D] px-5 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer',
          !hasNext && 'cursor-not-allowed opacity-50',
          hasNext && 'hover:bg-[#001a33]',
        )}
      >
        Câu tiếp theo
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
