'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Play, RotateCcw, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { examService } from '@/features/exam/exam.service'

const ABANDON_ERROR_MSG =
  'Không thể hủy bài thi. Vui lòng thử lại hoặc tiếp tục bài thi hiện tại.'

const EXAM_IN_PROGRESS_DISPLAY_MSG =
  'Bạn đang có bài thi chưa hoàn thành. Vui lòng nộp bài hoặc tiếp tục làm bài thi hiện tại trước khi bắt đầu bài mới.'

const EXAM_CONFIG = {
  categoryId: 1,
  numberOfQuestions: 60,
}

const EXAM_INFO = {
  title: 'BÀI THI ĐÁNH GIÁ\nNĂNG LỰC SỐ',
  description:
    'Bài thi Đánh giá năng lực số theo thông tư 02/2025 Bộ GD&ĐT. Vui lòng chuẩn bị kết nối mạng ổn định trước khi bắt đầu.',
  totalQuestions: 60,
  duration: "45'",
  format: 'Trắc nghiệm\nvà tự luận',
}

const EXAM_IN_PROGRESS_KEYWORDS = [
  'already have an exam in progress',
  'exam in progress',
  'bài thi đang làm',
  'đang có bài thi',
  'hết thời gian',
  'time expired',
]

function isExamInProgressError(message: string): boolean {
  const lower = message.toLowerCase()
  return EXAM_IN_PROGRESS_KEYWORDS.some((k) => lower.includes(k.toLowerCase()))
}

function getExamIdFromErrorResponse(data: unknown): number | null {
  if (!data || typeof data !== 'object') return null
  const obj = data as Record<string, unknown>
  const inner = obj.data as Record<string, unknown> | undefined
  for (const source of [obj, inner]) {
    if (!source) continue
    const id =
      source.examId ??
      source.sessionId ??
      source.id ??
      source.examSessionId
    if (typeof id === 'number' && Number.isFinite(id)) return id
    const session = source.examSession as { id?: number } | undefined
    if (session && typeof session.id === 'number') return session.id
  }
  return null
}

export default function ExamPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [examInProgress, setExamInProgress] = useState(false)
  const [currentExamId, setCurrentExamId] = useState<number | null>(null)
  const [abandonLoading, setAbandonLoading] = useState(false)

  const showExamActionDialog =
    !!error &&
    (examInProgress || error === ABANDON_ERROR_MSG)

  const dialogMessage =
    error === ABANDON_ERROR_MSG ? error : EXAM_IN_PROGRESS_DISPLAY_MSG

  const closeExamActionDialog = () => {
    setError('')
    setExamInProgress(false)
    setCurrentExamId(null)
  }

  const handleStart = async (alreadyResetOnce = false) => {
    setError('')
    setExamInProgress(false)
    setLoading(true)
    try {
      const session = await examService.generate({
        categoryId: EXAM_CONFIG.categoryId,
        numberOfQuestions: EXAM_CONFIG.numberOfQuestions,
      })
      sessionStorage.setItem('examSession', JSON.stringify(session))
      router.push(`/exam/${session.id}/take`)
    } catch (err: unknown) {
      const res = (err as { response?: { status?: number; data?: { message?: string } } })
        ?.response
      const status = res?.status
      const msg =
        res?.data?.message ||
        (status === 401
          ? 'Phiên đăng nhập hết hạn hoặc bạn không có quyền làm bài thi. Vui lòng đăng nhập lại.'
          : 'Không thể tạo bài thi. Vui lòng thử lại.')

      if (status === 400 && isExamInProgressError(msg) && !alreadyResetOnce) {
        let examId = getExamIdFromErrorResponse(res?.data)
        if (examId == null) {
          const current = await examService.getCurrentSession()
          examId = current?.id ?? null
        }
        if (examId != null) {
          try {
            await examService.submitExam(examId)
          } catch {
            // Bài có thể đã nộp rồi (đã hoàn thành) — vẫn thử gọi generate lại
          }
          return handleStart(true)
        }
        setError(
          'Không thể reset bài thi cũ. Vui lòng liên hệ quản trị hoặc thử đăng nhập lại.',
        )
        setExamInProgress(true)
        return
      }

      setError(msg)
      if (status === 400 && isExamInProgressError(msg)) {
        setExamInProgress(true)
        const id = getExamIdFromErrorResponse(res?.data)
        if (id != null) setCurrentExamId(id)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResume = async () => {
    setError('')
    setLoading(true)
    try {
      const session = await examService.resume()
      if (session) {
        sessionStorage.setItem('examSession', JSON.stringify(session))
        router.push(`/exam/${session.id}/take`)
      } else {
        setError('Không tìm thấy bài thi đang làm. Vui lòng thử "Hủy và làm bài mới".')
      }
    } catch {
      setError('Không thể tải bài thi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleAbandonAndStartNew = async () => {
    setError('')
    setAbandonLoading(true)
    try {
      let examId = currentExamId
      if (examId == null) {
        const current = await examService.getCurrentSession()
        examId = current?.id ?? null
      }
      if (examId == null) {
        setError(
          'Không lấy được mã bài thi. Vui lòng thử "Tiếp tục bài thi" để vào làm tiếp, hoặc liên hệ quản trị để hủy bài thi đang làm.',
        )
        return
      }
      await examService.submitExam(examId)
      setExamInProgress(false)
      setCurrentExamId(null)
      await handleStart()
    } catch {
      setError(ABANDON_ERROR_MSG)
    } finally {
      setAbandonLoading(false)
    }
  }

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12">
      {/* Decorative ellipse */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="h-[480px] w-[720px] rounded-[50%] opacity-10"
          style={{
            background:
              'radial-gradient(ellipse at center, #EF4444 0%, #003562 50%, transparent 70%)',
          }}
        />
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white px-8 py-10 shadow-lg sm:px-12">
        <h1 className="whitespace-pre-line text-center text-2xl font-extrabold leading-tight text-main sm:text-3xl">
          {EXAM_INFO.title}
        </h1>

        <p className="mt-4 text-center text-sm leading-relaxed text-gray-500">
          {EXAM_INFO.description}
        </p>

        {/* Info table */}
        <div className="mx-auto mt-8 max-w-sm divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200">
          {[
            { label: 'Tổng câu hỏi:', value: `${EXAM_INFO.totalQuestions} câu` },
            { label: 'Thời gian:', value: EXAM_INFO.duration },
            { label: 'Hình thức:', value: EXAM_INFO.format },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between px-6 py-3"
            >
              <span className="text-sm text-gray-500">{row.label}</span>
              <span className="whitespace-pre-line text-right text-sm font-bold text-gray-900">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {error && !showExamActionDialog && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
            <p>{error}</p>
            {(error.includes('đăng nhập') || error.includes('quyền')) && (
              <Link
                href="/"
                className="mt-2 inline-block text-sm font-medium underline underline-offset-2 hover:no-underline"
              >
                Đi tới trang đăng nhập
              </Link>
            )}
          </div>
        )}

        <Dialog open={showExamActionDialog} onOpenChange={(open) => !open && closeExamActionDialog()}>
          <DialogContent className="max-w-md border-red-200 bg-[#FFFAFA] p-6 sm:rounded-xl">
            <DialogTitle className="sr-only">
              Thông báo bài thi đang làm
            </DialogTitle>
            <DialogDescription className="sr-only">
              {dialogMessage}
            </DialogDescription>
            <p className="text-center text-sm font-medium text-red-600">
              {dialogMessage}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={handleResume}
                disabled={loading}
                variant="outline"
                className="gap-2 rounded-xl border-2 border-[#00284D] bg-white text-[#00284D] hover:bg-[#00284D]/5"
              >
                <Send className="h-4 w-4" />
                Tiếp tục bài thi
              </Button>
              <Button
                onClick={handleAbandonAndStartNew}
                disabled={loading || abandonLoading}
                className="gap-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600"
              >
                <RotateCcw className="h-4 w-4" />
                {abandonLoading ? 'Đang xử lý...' : 'Hủy và làm bài mới'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Start button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleStart}
            disabled={loading}
            className="h-12 gap-2 rounded-xl bg-main px-8 text-base font-semibold text-white hover:bg-[#002244]"
          >
            {loading ? 'Đang tạo bài thi...' : 'Bắt đầu làm bài'}
            {!loading && <Play className="h-4 w-4 fill-current" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
