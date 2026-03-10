'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react'

interface ExamFooterProps {
  onPrevious: () => void
  onNext: () => void
  onFlag: () => void
  hasPrevious: boolean
  hasNext: boolean
  isFlagged: boolean
}

export default function ExamFooter({
  onPrevious,
  onNext,
  onFlag,
  hasPrevious,
  hasNext,
  isFlagged,
}: ExamFooterProps) {
  return (
    <div className="sticky bottom-0 z-10 flex items-center justify-between border-t border-gray-200 bg-[#CBD5E1] px-6 py-3">
      <Button
        onClick={onPrevious}
        disabled={!hasPrevious}
        variant="outline"
        className="gap-1 rounded-xl border-gray-400 bg-white"
      >
        <ChevronLeft className="h-4 w-4" />
        Quay lại
      </Button>

      <Button
        onClick={onFlag}
        variant="outline"
        className={`gap-2 rounded-xl ${
          isFlagged
            ? 'border-safety-orange bg-safety-orange/10 text-safety-orange'
            : 'border-safety-orange text-safety-orange bg-white'
        }`}
      >
        <Flag className="h-4 w-4" />
        Đánh dấu xem lại
      </Button>

      <Button
        onClick={onNext}
        disabled={!hasNext}
        className="gap-1 rounded-xl bg-main text-white hover:bg-[#002244]"
      >
        Câu tiếp theo
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
