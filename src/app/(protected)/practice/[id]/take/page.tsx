'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Lightbulb } from 'lucide-react'
import RoleGuard from '@/components/common/RoleGuard'
import { Button } from '@/components/ui/button'
import PracticeResultDialog from '@/components/practice/PracticeResultDialog'
import { practiceService } from '@/features/practice/practice.service'
import type { SubmitPracticeAttemptResult } from '@/types/practice'

const AUTOSAVE_INTERVAL_MS = 30_000

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function TakePracticeContent() {
  const params = useParams()
  const router = useRouter()
  const exerciseId = Number(params?.id)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [showHint, setShowHint] = useState<Record<number, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitPracticeAttemptResult | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const answersRef = useRef(answers)
  answersRef.current = answers

  const { data: attempt, isLoading } = useQuery({
    queryKey: ['practice-attempt', exerciseId],
    queryFn: () => practiceService.startAttempt(exerciseId),
    enabled: Number.isFinite(exerciseId),
  })

  // The attempt endpoint doesn't expose exercise config (time limit, reveal mode);
  // look it up from the assigned-exercises list instead (student-accessible).
  const { data: assigned = [] } = useQuery({
    queryKey: ['practice-assigned'],
    queryFn: practiceService.getAssignedExercises,
    enabled: Number.isFinite(exerciseId),
  })
  const exerciseConfig = useMemo(
    () => assigned.find((e) => e.id === exerciseId)?.config,
    [assigned, exerciseId],
  )

  useEffect(() => {
    if (attempt?.answerIds) setAnswers(attempt.answerIds)
  }, [attempt])

  const submitMutation = useMutation({
    mutationFn: () => {
      if (!attempt) throw new Error('No attempt')
      return practiceService.submitAttempt(attempt.id, { answerIds: answersRef.current })
    },
    onSuccess: (res) => setResult(res),
    onSettled: () => setSubmitting(false),
  })

  const handleSubmit = () => {
    setSubmitting(true)
    submitMutation.mutate()
  }

  // Autosave progress every 30s
  useEffect(() => {
    if (!attempt) return
    const interval = setInterval(() => {
      practiceService.saveProgress(attempt.id, answersRef.current).catch(() => {})
    }, AUTOSAVE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [attempt])

  // Client-side timer: backend does NOT enforce timeLimitMinutes, so this only
  // auto-submits from the UI side; it is not a security boundary.
  useEffect(() => {
    if (!exerciseConfig?.timeLimitMinutes || result) return
    setTimeRemaining((prev) => prev ?? exerciseConfig.timeLimitMinutes! * 60)
  }, [exerciseConfig, result])

  useEffect(() => {
    if (timeRemaining == null || result) return
    if (timeRemaining <= 0) {
      handleSubmit()
      return
    }
    const t = setTimeout(() => setTimeRemaining((prev) => (prev != null ? prev - 1 : prev)), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, result])

  if (!Number.isFinite(exerciseId)) return null

  if (isLoading || !attempt) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#E8F4FF]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-main border-t-transparent" />
      </main>
    )
  }

  const question = attempt.questions[currentIndex]
  const isMc = question.options.length > 0
  const answeredCount = attempt.questions.filter((q) => answers[q.id] != null).length

  return (
    <main className="min-h-screen bg-[#E8F4FF] pb-16">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Câu {currentIndex + 1}/{attempt.questions.length} · Đã trả lời {answeredCount}
          </p>
          {timeRemaining != null && (
            <span className="rounded-lg bg-white px-3 py-1 text-sm font-semibold text-main shadow-sm">
              {formatTime(timeRemaining)}
            </span>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {attempt.questions.map((q, i) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                i === currentIndex
                  ? 'bg-main text-white'
                  : answers[q.id] != null
                    ? 'bg-green-100 text-green-700'
                    : 'bg-white text-gray-600'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-base font-medium text-gray-900">{question.content}</p>

          {question.hint && (
            <div className="mt-3">
              {showHint[question.id] ? (
                <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">{question.hint}</p>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowHint((prev) => ({ ...prev, [question.id]: true }))}
                  className="inline-flex items-center gap-1 text-sm text-amber-600 hover:underline cursor-pointer"
                >
                  <Lightbulb className="h-4 w-4" />
                  Xem gợi ý
                </button>
              )}
            </div>
          )}

          <div className="mt-5 space-y-2">
            {isMc ? (
              question.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: opt.id }))}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors cursor-pointer ${
                    answers[question.id] === opt.id
                      ? 'border-main bg-main/5 text-main font-medium'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {opt.optionText}
                </button>
              ))
            ) : (
              <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                Đây là câu hỏi tự luận để bạn tự phản ánh — hệ thống không chấm điểm câu này. Hãy suy
                nghĩ về câu trả lời của bạn trước khi xem lời giải sau khi nộp bài.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          >
            Câu trước
          </Button>
          {currentIndex < attempt.questions.length - 1 ? (
            <Button
              className="bg-main hover:bg-[#002244]"
              onClick={() => setCurrentIndex((i) => Math.min(attempt.questions.length - 1, i + 1))}
            >
              Câu tiếp
            </Button>
          ) : (
            <Button
              className="bg-green-600 hover:bg-green-700"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
            </Button>
          )}
        </div>
      </div>

      <PracticeResultDialog
        result={result}
        open={result != null}
        onClose={() => router.push('/practice')}
      />
    </main>
  )
}

export default function TakePracticePage() {
  return (
    <RoleGuard allowedRoles={['student']}>
      <TakePracticeContent />
    </RoleGuard>
  )
}
