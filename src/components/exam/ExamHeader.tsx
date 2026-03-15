'use client'

import { ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface ExamHeaderProps {
  questionNumber: number
  timeRemaining: number
  isCritical: boolean
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
}: ExamHeaderProps) {
  const { user } = useAuth()
  const displayName = user?.fullName ?? user?.name ?? user?.email ?? 'Student'
  const displayEmail = user?.email ?? ''

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center gap-6">
        <span className="text-base font-bold text-[#00284D]">
          Assessment - TN
        </span>
        <span className="text-sm text-gray-500">
          Câu hỏi số {questionNumber}
        </span>
      </div>

      <div className="flex items-center gap-8">
        <div className="text-right">
          <p className="text-xs text-gray-500">Thời gian làm bài còn lại</p>
          <p
            className={cn(
              'text-2xl font-bold tabular-nums text-gray-900',
              isCritical && 'animate-pulse text-red-600',
            )}
          >
            {formatTime(timeRemaining)}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00284D] text-sm font-semibold text-white">
            {(displayName[0] ?? 'S').toUpperCase()}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">{displayName}</p>
            {displayEmail && (
              <p className="text-xs text-gray-500">{displayEmail}</p>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden />
        </div>
      </div>
    </header>
  )
}
