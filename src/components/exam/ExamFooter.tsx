'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExamFooterProps {
  onPrevious: () => void
  onNext: () => void
  onClearCurrent?: () => void
  onFlag?: () => void
  hasPrevious: boolean
  hasNext: boolean
  hasSelection?: boolean
}

export default function ExamFooter({
  onPrevious,
  onNext,
  onClearCurrent,
  onFlag,
  hasPrevious,
  hasNext,
  hasSelection = false,
}: ExamFooterProps) {
  return (
    <div className="flex shrink-0 items-center justify-between bg-[#00284D] px-6 py-4">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!hasPrevious}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer',
          !hasPrevious && 'cursor-not-allowed opacity-50',
          hasPrevious && 'hover:bg-white/20',
        )}
      >
        <ChevronLeft className="h-5 w-5" />
        Quay lại
      </button>

      <div className="flex items-center gap-3">
        {onClearCurrent && (
          <button
            type="button"
            onClick={onClearCurrent}
            disabled={!hasSelection}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-amber-900 transition-colors cursor-pointer',
              !hasSelection && 'cursor-not-allowed opacity-50',
              hasSelection && 'hover:bg-amber-500',
            )}
          >
            Chỉnh sửa làm lại
          </button>
        )}
        {onFlag && (
          <button
            type="button"
            onClick={onFlag}
            className="inline-flex items-center gap-2 rounded-lg bg-[#FEF3C7] px-5 py-2.5 text-sm font-semibold text-amber-900 transition-colors hover:bg-amber-200 cursor-pointer"
          >
            Đánh dấu xem lại
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg bg-white text-[#00284D] px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer',
          !hasNext && 'cursor-not-allowed opacity-50',
          hasNext && 'hover:bg-gray-100',
        )}
      >
        Câu tiếp theo
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
