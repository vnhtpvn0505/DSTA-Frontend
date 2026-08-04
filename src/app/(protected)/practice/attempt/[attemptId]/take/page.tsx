'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Lightbulb } from 'lucide-react'
import RoleGuard from '@/components/common/RoleGuard'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import PracticeResultDialog from '@/components/practice/PracticeResultDialog'
import { practiceService } from '@/features/practice/practice.service'
import type { SubmitPracticeAttemptResult } from '@/types/practice'

const AUTOSAVE_INTERVAL_MS = 30_000

/**
 * Generic "take an attempt" page — used for custom (self-picked criteria)
 * attempts and for resuming any in-progress attempt from history, where we
 * already have an attemptId and don't need to (re-)call the exercise-based
 * start endpoint. See practice/[id]/take for the exercise-assigned flow.
 */
function TakeAttemptContent() {
  const params = useParams()
  const router = useRouter()
  const attemptId = Number(params?.attemptId)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [showHint, setShowHint] = useState<Record<number, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitPracticeAttemptResult | null>(null)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const answersRef = useRef(answers)
  answersRef.current = answers

  const { data: attempt, isLoading } = useQuery({
    queryKey: ['practice-attempt-by-id', attemptId],
    queryFn: () => practiceService.getAttemptById(attemptId),
    enabled: Number.isFinite(attemptId),
  })

  useEffect(() => {
    if (attempt?.answerIds) setAnswers(attempt.answerIds)
  }, [attempt])

  const submitMutation = useMutation({
    mutationFn: () => practiceService.submitAttempt(attemptId, { answerIds: answersRef.current }),
    onSuccess: (res) => setResult(res),
    onSettled: () => setSubmitting(false),
  })

  const handleSubmit = () => {
    setSubmitting(true)
    submitMutation.mutate()
  }

  const requestSubmit = () => {
    const unanswered = attempt ? attempt.questions.filter((q) => answers[q.id] == null).length : 0
    if (unanswered > 0) {
      setConfirmSubmit(true)
      return
    }
    handleSubmit()
  }

  useEffect(() => {
    if (!Number.isFinite(attemptId)) return
    const interval = setInterval(() => {
      practiceService.saveProgress(attemptId, answersRef.current).catch(() => {})
    }, AUTOSAVE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [attemptId])

  if (!Number.isFinite(attemptId)) return null

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
              onClick={requestSubmit}
            >
              {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Còn câu hỏi chưa trả lời</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Bạn còn {attempt.questions.filter((q) => answers[q.id] == null).length} câu chưa trả lời.
            Bạn có chắc chắn muốn nộp bài không?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmSubmit(false)}>
              Tiếp tục làm bài
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setConfirmSubmit(false)
                handleSubmit()
              }}
            >
              Nộp bài
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PracticeResultDialog
        result={result}
        open={result != null}
        onClose={() => router.push('/practice')}
      />
    </main>
  )
}

export default function TakeAttemptPage() {
  return (
    <RoleGuard allowedRoles={['student']}>
      <TakeAttemptContent />
    </RoleGuard>
  )
}
