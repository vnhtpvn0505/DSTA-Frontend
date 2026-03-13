'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import ExamQuestionNav from '@/components/exam/ExamQuestionNav'
import ExamHeader from '@/components/exam/ExamHeader'
import ExamOptionList from '@/components/exam/ExamOptionList'
import ExamFooter from '@/components/exam/ExamFooter'
import type { ExamSession } from '@/types/exam'

export default function TakeExamPage() {
  const router = useRouter()

  const [session, setSession] = useState<ExamSession | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('examSession')
      if (raw) {
        const parsed: ExamSession = JSON.parse(raw)
        setSession(parsed)
        setTimeRemaining(parsed.remainingTime)
      } else {
        router.replace('/exam')
      }
    } catch {
      router.replace('/exam')
    }
  }, [router])

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
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-main border-t-transparent" />
      </div>
    )
  }

  const questions = session.questions
  const total = questions.length
  const currentQ = questions[currentIndex]
  const isCritical = timeRemaining < 5 * 60
  const answeredSet = new Set(Object.keys(answers).map(Number))
  const selectedOptionId = answers[currentIndex] ?? null

  const handleSelectOption = (optionId: number) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionId }))
  }

  const handleNext = () => {
    if (currentIndex < total - 1) setCurrentIndex((i) => i + 1)
  }

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }

  const handleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(currentIndex)) {
        next.delete(currentIndex)
      } else {
        next.add(currentIndex)
      }
      return next
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#E8F4FF]">
      {/* Left: Question navigation sidebar */}
      <ExamQuestionNav
        total={total}
        current={currentIndex}
        answeredSet={answeredSet}
        flaggedSet={flagged}
        onSelect={setCurrentIndex}
        onSubmit={() => setShowSubmitConfirm(true)}
      />

      {/* Right: Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header bar */}
        <ExamHeader
          questionNumber={currentIndex + 1}
          timeRemaining={timeRemaining}
          isCritical={isCritical}
          onNext={handleNext}
          hasNext={currentIndex < total - 1}
        />

        {/* Progress indicator */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-main transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>

        {/* Question + Options */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-lg font-semibold leading-relaxed text-gray-900">
              {currentQ.content}
            </h2>

            <ExamOptionList
              options={currentQ.options}
              selectedOptionId={selectedOptionId}
              onSelect={handleSelectOption}
            />
          </div>
        </div>

        {/* Footer navigation */}
        <ExamFooter
          onPrevious={handlePrev}
          onNext={handleNext}
          onFlag={handleFlag}
          hasPrevious={currentIndex > 0}
          hasNext={currentIndex < total - 1}
          isFlagged={flagged.has(currentIndex)}
        />
      </div>

      {/* Submit dialog */}
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
