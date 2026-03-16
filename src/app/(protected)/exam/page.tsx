'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { examService } from '@/features/exam/exam.service'

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

export default function ExamPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleStart = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await examService.generate(EXAM_CONFIG)
      const session = res.data.examSession
      sessionStorage.setItem('examSession', JSON.stringify(session))
      router.push(`/exam/${session.id}/take`)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Không thể tạo bài thi. Vui lòng thử lại.'
      setError(msg)
    } finally {
      setLoading(false)
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

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Start button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => void handleStart()}
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
