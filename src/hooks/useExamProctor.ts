import { useEffect, useRef } from 'react'
import { examService } from '@/features/exam/exam.service'

interface UseExamProctorOptions {
  /** UserExam ID to report violations against */
  examId: number
  /** Called on each violation with updated count */
  onViolation?: (count: number) => void
  /** Called when violations reach threshold and exam is auto-submitted */
  onAutoSubmit?: () => void
  /** Whether proctoring is active (set false when exam is done) */
  enabled?: boolean
}

/**
 * Monitors the exam window for cheating signals (tab switches, window blurs,
 * copy-paste attempts) and reports them to the backend.
 *
 * After 3 violations the backend auto-submits the exam and `onAutoSubmit` is
 * called so the caller can redirect/clean up.
 */
export function useExamProctor({
  examId,
  onViolation,
  onAutoSubmit,
  enabled = true,
}: UseExamProctorOptions): void {
  // Prevent duplicate events from firing in rapid succession
  const throttleRef = useRef<NodeJS.Timeout | null>(null)
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  const report = async (type: 'tab_switch' | 'window_blur' | 'copy_paste') => {
    if (!enabledRef.current || !Number.isFinite(examId)) return
    // Throttle: ignore repeated events within 2 s
    if (throttleRef.current) return
    throttleRef.current = setTimeout(() => {
      throttleRef.current = null
    }, 2_000)

    try {
      const result = await examService.reportViolation(examId, type)
      onViolation?.(result.violationCount)
      if (result.autoSubmitted) {
        onAutoSubmit?.()
      }
    } catch {
      // Silently ignore network errors — proctoring must never crash the exam
    }
  }

  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        report('tab_switch')
      }
    }

    const handleBlur = () => {
      report('window_blur')
    }

    const handleCopy = (e: ClipboardEvent) => {
      // Only flag if the user is copying question content (not their own input)
      const target = e.target as HTMLElement | null
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      if (!isInput) {
        report('copy_paste')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    document.addEventListener('copy', handleCopy)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('copy', handleCopy)
      if (throttleRef.current) clearTimeout(throttleRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, examId])
}
