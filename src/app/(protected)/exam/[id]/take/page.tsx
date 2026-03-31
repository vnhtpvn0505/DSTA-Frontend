'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import ExamQuestionNav from '@/components/exam/ExamQuestionNav'
import ExamHeader from '@/components/exam/ExamHeader'
import ExamOptionList from '@/components/exam/ExamOptionList'
import ExamFooter from '@/components/exam/ExamFooter'
import { examService } from '@/features/exam/exam.service'
import type { SubmitExamResult } from '@/features/exam/exam.service'
import type { ExamSession } from '@/types/exam'

export default function TakeExamPage() {
  const router = useRouter()
  const params = useParams()
  const examId = params?.id != null ? Number(params.id) : NaN

  const [session, setSession] = useState<ExamSession | null>(null)
  const [loadingRestore, setLoadingRestore] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitResult, setSubmitResult] = useState<SubmitExamResult | null>(null)
  const [showResultPopup, setShowResultPopup] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const autosaveRef = useRef<NodeJS.Timeout | null>(null)
  const sessionRef = useRef<ExamSession | null>(null)
  const answersRef = useRef<Record<number, number>>({})
  const timeRemainingRef = useRef(0)
  const prevNextRef = useRef<{
    goPrev: () => void
    goNext: () => void
    preventShortcuts: boolean
  }>({ goPrev: () => {}, goNext: () => {}, preventShortcuts: true })

  sessionRef.current = session
  answersRef.current = answers
  timeRemainingRef.current = timeRemaining

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const raw = sessionStorage.getItem('examSession')
        if (raw) {
          const parsed: ExamSession = JSON.parse(raw)
          if (parsed.id === examId || !Number.isFinite(examId)) {
            if (!cancelled) {
              setSession(parsed)
              setTimeRemaining(parsed.remainingTime)
            }
            setLoadingRestore(false)
            return
          }
        }
        if (!Number.isFinite(examId)) {
          if (!cancelled) router.replace('/exam')
          setLoadingRestore(false)
          return
        }
        const restored = await examService.getSessionById(examId)
        if (cancelled) return
        if (restored) {
          setSession(restored)
          setTimeRemaining(restored.remainingTime)
          try {
            sessionStorage.setItem('examSession', JSON.stringify(restored))
          } catch {
            /* ignore */
          }
        } else {
          router.replace('/exam')
        }
      } catch {
        if (!cancelled) router.replace('/exam')
      } finally {
        if (!cancelled) setLoadingRestore(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [router, examId])

  useEffect(() => {
    if (!session) return
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!session) return
    autosaveRef.current = setInterval(async () => {
      const s = sessionRef.current
      if (!s) return
      try {
        await examService.saveProgress(s.id, {
          answerIds: answersRef.current,
          remainingTime: timeRemainingRef.current,
        })
      } catch {
        // silent — autosave failures should not interrupt the exam
      }
    }, 30_000)
    return () => {
      if (autosaveRef.current) clearInterval(autosaveRef.current)
    }
  }, [session])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const { goPrev, goNext, preventShortcuts } = prevNextRef.current
      if (preventShortcuts) return
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleSubmit = useCallback(async () => {
    const s = sessionRef.current
    if (!s || !Number.isFinite(examId)) return
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setShowSubmitConfirm(false)
    setSubmitError('')
    setSubmitting(true)
    try {
      const ans = answersRef.current
      const answerIds = s.questions
        .map((_, i) => ans[i])
        .filter((id): id is number => id != null)
      const result = await examService.submitExam(examId, { answerIds })
      sessionStorage.removeItem('examSession')
      setSubmitResult(result)
      setShowResultPopup(true)
    } catch {
      setSubmitError('Không thể nộp bài. Vui lòng kiểm tra kết nối và thử lại.')
    } finally {
      setSubmitting(false)
    }
  }, [examId])

  const handleCloseResultPopup = useCallback(() => {
    setShowResultPopup(false)
    setSubmitResult(null)
    router.push('/certificate')
  }, [router])

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00284D] border-t-transparent" />
      </div>
    )
  }

  const questions = session.questions
  const total = questions.length
  const currentQ = questions[currentIndex]
  const isCritical = timeRemaining < 5 * 60
  const answeredSet = new Set(Object.keys(answers).map(Number))
  const selectedOptionId = answers[currentIndex] ?? null
  const hasSelection = selectedOptionId != null

  const handleSelectOption = (optionId: number) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionId }))
  }

  const handleNext = () => {
    if (currentIndex < total - 1) setCurrentIndex((i) => i + 1)
  }

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }

  const handleClearCurrent = () => {
    setAnswers((prev) => {
      const next = { ...prev }
      delete next[currentIndex]
      return next
    })
  }

  const handleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(currentIndex)) next.delete(currentIndex)
      else next.add(currentIndex)
      return next
    })
  }

  prevNextRef.current.goPrev = handlePrev
  prevNextRef.current.goNext = handleNext
  prevNextRef.current.preventShortcuts =
    showSubmitConfirm || showResultPopup || !!submitError

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#F5F7FA]">
      {/* Header: Assessment title + timer + user */}
      <ExamHeader
        questionNumber={currentIndex + 1}
        timeRemaining={timeRemaining}
        isCritical={isCritical}
        onNext={handleNext}
        hasNext={currentIndex < total - 1}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Question list sidebar */}
        <ExamQuestionNav
          total={total}
          current={currentIndex}
          answeredSet={answeredSet}
          flaggedSet={flagged}
          onSelect={setCurrentIndex}
          onSubmit={() => setShowSubmitConfirm(true)}
        />

        {/* Right: Question content + options + footer */}
        <div className="flex flex-1 flex-col overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="mx-auto max-w-3xl">
              <Link
                href="#"
                className="mb-4 inline-block rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
                onClick={(e) => e.preventDefault()}
              >
                Hướng dẫn làm bài thi
              </Link>

              <h2 className="mb-6 text-xl font-bold leading-relaxed text-gray-900">
                {currentQ.content}
              </h2>

              <ExamOptionList
                options={currentQ.options}
                selectedOptionId={selectedOptionId}
                onSelect={handleSelectOption}
              />
            </div>
          </div>

          <ExamFooter
            onPrevious={handlePrev}
            onNext={handleNext}
            onClearCurrent={handleClearCurrent}
            onFlag={handleFlag}
            hasPrevious={currentIndex > 0}
            hasNext={currentIndex < total - 1}
            hasSelection={hasSelection}
          />
        </div>
      </div>

      <ConfirmDialog
        open={showSubmitConfirm}
        onOpenChange={(open) => {
          if (!submitting) setShowSubmitConfirm(open)
        }}
        title="Xác nhận nộp bài"
        description={`Bạn đã trả lời ${answeredSet.size}/${total} câu hỏi. Bạn có chắc chắn muốn nộp bài?`}
        confirmText="Nộp bài"
        cancelText="Hủy"
        onConfirm={handleSubmit}
        variant="default"
        isLoading={submitting}
      />

      {/* Popup kết quả từ API POST /exam/{id}/submit */}
      <Dialog open={showResultPopup} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Kết quả bài thi</DialogTitle>
            <DialogDescription className="sr-only">
              Điểm số và trạng thái đạt/chưa đạt từ bài thi vừa nộp
            </DialogDescription>
          </DialogHeader>
          {submitResult && (
            <div className="space-y-4 py-2">
              <div className="flex items-baseline justify-between gap-4 rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Điểm số
                </span>
                <span className="text-2xl font-bold tabular-nums text-foreground">
                  {submitResult.score ?? 0}
                  {submitResult.totalScore != null && (
                    <span className="ml-1 text-lg font-normal text-muted-foreground">
                      / {submitResult.totalScore}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Kết quả
                </span>
                <span
                  className={
                    submitResult.passed
                      ? 'font-semibold text-green-600 dark:text-green-400'
                      : 'font-semibold text-amber-600 dark:text-amber-400'
                  }
                >
                  {submitResult.passed ? 'Đạt' : 'Chưa đạt'}
                </span>
              </div>
              {submitResult.message && (
                <p className="text-sm text-muted-foreground">
                  {submitResult.message}
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleCloseResultPopup}>Xem chứng chỉ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lỗi nộp bài */}
      <Dialog
        open={!!submitError}
        onOpenChange={(open) => !open && setSubmitError('')}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Không thể nộp bài</DialogTitle>
            <DialogDescription>{submitError}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitError('')}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-muted-foreground">
              Đang nộp bài...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
