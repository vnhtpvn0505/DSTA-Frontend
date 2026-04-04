'use client'

import { cn } from '@/lib/utils'

interface ExamSAInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const MAX_CHARS = 3000

export default function ExamSAInput({ value, onChange, disabled }: ExamSAInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <textarea
        className={cn(
          'w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed text-gray-900',
          'placeholder:text-gray-400 focus:border-[#00284D] focus:outline-none focus:ring-2 focus:ring-[#00284D]/20',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
          'min-h-[140px]',
        )}
        placeholder="Nhập câu trả lời của bạn tại đây..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={MAX_CHARS}
        disabled={disabled}
      />
      <p className="self-end text-xs text-gray-400 tabular-nums">
        {value.length}/{MAX_CHARS}
      </p>
    </div>
  )
}
