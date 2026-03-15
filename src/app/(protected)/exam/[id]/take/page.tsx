'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import ExamQuestionNav from '@/components/exam/ExamQuestionNav'
import ExamHeader from '@/components/exam/ExamHeader'
import ExamOptionList from '@/components/exam/ExamOptionList'
import ExamFooter from '@/components/exam/ExamFooter'
import { examService } from '@/features/exam/exam.service'
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
  const timerRef = useRef<NodeJS.Timeout | null>(null)

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

  const handleSubmit = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    sessionStorage.removeItem('examSession')
    // TODO: POST answers to API
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

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#F5F7FA]">
      {/* Header: Assessment title + timer + user */}
      <ExamHeader
        questionNumber={currentIndex + 1}
        timeRemaining={timeRemaining}
        isCritical={isCritical}
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
            hasPrevious={currentIndex > 0}
            hasNext={currentIndex < total - 1}
            hasSelection={hasSelection}
          />
        </div>
      </div>

      <ConfirmDialog
        open={showSubmitConfirm}
        onOpenChange={setShowSubmitConfirm}
        title="Xác nhận nộp bài"
        description={`Bạn đã trả lời ${answeredSet.size}/${total} câu hỏi. Bạn có chắc chắn muốn nộp bài?`}
        confirmText="Nộp bài"
        cancelText="Hủy"
        onConfirm={handleSubmit}
        variant="default"
      />
    </div>
  )
}
