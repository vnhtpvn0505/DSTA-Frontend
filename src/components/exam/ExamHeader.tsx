'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface ExamHeaderProps {
  questionNumber: number
  timeRemaining: number
  isCritical: boolean
  onNext?: () => void
  hasNext?: boolean
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function ExamHeader({
  questionNumber,
  timeRemaining,
  isCritical,
  onNext,
  hasNext = true,
}: ExamHeaderProps) {
  const { user } = useAuth()
  const displayName =
    user?.firstName ?? user?.email ?? 'Student'
  const displayEmail = user?.email ?? ''

  return (
    <header className="flex shrink-0 items-center justify-between bg-[#00284D] px-6 py-4">
      <div className="flex items-center gap-6">
        <span className="text-base font-bold text-white">
          Câu hỏi số {questionNumber}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-xs text-white/80">Thời gian làm bài còn lại:</p>
          <p
            className={cn(
              'text-2xl font-bold tabular-nums text-white',
              isCritical && 'animate-pulse text-red-300',
            )}
          >
            {formatTime(timeRemaining)}
          </p>
        </div>

        {onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer',
              !hasNext && 'cursor-not-allowed opacity-50',
              hasNext && 'hover:bg-white/20',
            )}
          >
            Câu tiếp theo
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white">
            {(displayName[0] ?? 'S').toUpperCase()}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">{displayName}</p>
            {displayEmail && (
              <p className="text-xs text-white/70">{displayEmail}</p>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-white/60" aria-hidden />
        </div>
      </div>
    </header>
  )
}
