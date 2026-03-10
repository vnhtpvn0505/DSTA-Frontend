'use client'

import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

interface ExamHeaderProps {
  questionNumber: number
  tag?: string
  timeRemaining: number
  isCritical: boolean
  onNext: () => void
  hasNext: boolean
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function ExamHeader({
  questionNumber,
  tag,
  timeRemaining,
  isCritical,
  onNext,
  hasNext,
}: ExamHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-main px-6 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-white">
          Câu hỏi số {questionNumber}
        </span>
        {tag && (
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
            {tag}
          </span>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-xs text-white/70">Thời gian làm bài còn lại:</p>
          <p
            className={cn(
              'text-2xl font-extrabold tabular-nums text-white',
              isCritical && 'animate-pulse text-red-300',
            )}
          >
            {formatTime(timeRemaining)}
          </p>
        </div>

        {hasNext && (
          <Button
            onClick={onNext}
            className="gap-1 rounded-xl bg-white text-main hover:bg-gray-100"
          >
            Câu tiếp theo
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
