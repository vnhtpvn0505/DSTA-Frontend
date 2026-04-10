'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import RoleGuard from '@/components/common/RoleGuard'
import {
  gradingService,
  type SaGradingDetail,
  type SaGradingItem,
  type GradeSaResult,
} from '@/features/exam/grading.service'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, ClipboardCheck, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAX_SCORE_PER_QUESTION = 10

function ScoreInput({
  value,
  onChange,
  disabled,
}: {
  value: number | null
  onChange: (v: number) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: MAX_SCORE_PER_QUESTION + 1 }, (_, i) => i).map((s) => (
        <button
          key={s}
          type="button"
          disabled={disabled}
          onClick={() => onChange(s)}
          className={cn(
            'w-8 h-8 rounded-md text-sm font-semibold border transition-all',
            value === s
              ? 'bg-main text-white border-main shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-main hover:text-main',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          {s}
        </button>
      ))}
    </div>
  )
}

function GradingFormContent({ id }: { id: number }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [scores, setScores] = useState<Record<number, number>>({})
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState<GradeSaResult | null>(null)

  const { data: detail, isLoading, error } = useQuery<SaGradingDetail>({
    queryKey: ['grading-detail', id],
    queryFn: () => gradingService.getDetail(id),
  })

  const { mutate: submitGrade, isPending: submitting } = useMutation({
    mutationFn: () =>
      gradingService.submitGrade(id, { saScores: scores, graderComment: comment || undefined }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['grading-pending'] })
      setSubmitted(result)
    },
  })

  const allScored =
    detail != null &&
    detail.saItems.length > 0 &&
    detail.saItems.every((item: SaGradingItem) => scores[item.saQuestionId] != null)

  const totalSa = Object.values(scores).reduce((s, v) => s + v, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#E8F4FF]">
        <div className="text-gray-500 animate-pulse">Đang tải bài thi...</div>
      </div>
    )
  }

  if (error || !detail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#E8F4FF] gap-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-gray-600">Không thể tải bài thi. Bài thi có thể đã được chấm hoặc không tồn tại.</p>
        <Button variant="outline" onClick={() => router.push('/grading')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#E8F4FF] gap-6 px-4">
        <div className="bg-white rounded-2xl shadow-md border border-green-100 p-10 text-center max-w-md w-full">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-main mb-2">Chấm điểm thành công!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Kết quả đã được cập nhật cho sinh viên {detail.studentName}.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl bg-blue-50 py-3">
              <div className="text-xs text-gray-500 mb-1">Điểm trắc nghiệm</div>
              <div className="text-xl font-bold text-blue-700">{submitted.mcScore}</div>
            </div>
            <div className="rounded-xl bg-orange-50 py-3">
              <div className="text-xs text-gray-500 mb-1">Điểm tự luận</div>
              <div className="text-xl font-bold text-orange-600">{submitted.saScore}</div>
            </div>
            <div className="rounded-xl bg-main/10 py-3">
              <div className="text-xs text-gray-500 mb-1">Tổng điểm</div>
              <div className="text-xl font-bold text-main">{submitted.totalScore}</div>
            </div>
          </div>
          <div className="mb-6">
            <span
              className={cn(
                'inline-block rounded-full text-sm px-4 py-1 font-semibold',
                submitted.isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600',
              )}
            >
              {submitted.isPassed ? '\u2713 \u0110\u1ea1t \u2014 ' : '\u2717 Ch\u01b0a \u0111\u1ea1t \u2014 '}
              {submitted.rankName}
            </span>
          </div>
          <Button className="bg-main hover:bg-main/90 text-white w-full" onClick={() => router.push('/grading')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#E8F4FF]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.push('/grading')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-main transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Danh sách
          </button>
          <span className="text-gray-300">/</span>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-main" />
            <span className="font-semibold text-main">Chấm điểm bài thi #{id}</span>
          </div>
        </div>

        {/* Student info + MC score card */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 mb-6 flex flex-wrap items-center gap-6">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Sinh viên</div>
            <div className="font-semibold text-gray-800">{detail.studentName}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Điểm trắc nghiệm</div>
            <div className="font-semibold text-blue-700">{detail.mcScore} điểm</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Số câu tự luận</div>
            <div className="font-semibold text-orange-600">{detail.saItems.length} câu</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Điểm TL hiện tại</div>
            <div className="font-bold text-2xl text-main">
              {totalSa} <span className="text-base font-normal text-gray-400">/ {detail.saItems.length * MAX_SCORE_PER_QUESTION}</span>
            </div>
          </div>
        </div>

        {/* SA Questions */}
        <div className="space-y-5 mb-6">
          {detail.saItems.map((item: SaGradingItem, idx: number) => (
            <div key={item.saQuestionId} className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="font-semibold text-gray-800">
                  Câu {idx + 1}: {item.question}
                </h3>
                <span className="shrink-0 rounded-full border border-main text-main text-xs font-semibold px-3 py-0.5">
                  {scores[item.saQuestionId] ?? '\u2014'} / {MAX_SCORE_PER_QUESTION}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-5">
                <div>
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Đáp án mẫu
                  </div>
                  <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-sm text-gray-700 whitespace-pre-wrap">
                    {item.modelAnswer}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Câu trả lời của sinh viên
                  </div>
                  <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-sm text-gray-700 whitespace-pre-wrap min-h-[60px]">
                    {item.studentAnswer || <span className="italic text-gray-400">Không có câu trả lời</span>}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-500 mb-2">Điểm (0–{MAX_SCORE_PER_QUESTION})</div>
                <ScoreInput
                  value={scores[item.saQuestionId] ?? null}
                  onChange={(v) => setScores((prev) => ({ ...prev, [item.saQuestionId]: v }))}
                  disabled={submitting}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Comment + Submit */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nhận xét của giáo viên <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
          </label>
          <textarea
            placeholder="Nh\u1eadp nh\u1eadn x\u00e9t, g\u00f3p \u00fd cho sinh vi\u00ean..."
            value={comment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
            disabled={submitting}
            rows={3}
            className="w-full resize-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-main/30 disabled:opacity-60"
          />

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              {allScored
                ? `Đã chấm xong ${detail.saItems.length}/${detail.saItems.length} câu`
                : `Cần chấm ${detail.saItems.filter((i: SaGradingItem) => scores[i.saQuestionId] == null).length} câu còn lại`}
            </p>
            <Button
              className="bg-main hover:bg-main/90 text-white px-8"
              disabled={!allScored || submitting}
              onClick={() => submitGrade()}
            >
              {submitting ? 'Đang lưu...' : 'Xác nhận chấm điểm'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function GradingDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  return (
    <RoleGuard allowedRoles={['admin']}>
      <GradingFormContent id={id} />
    </RoleGuard>
  )
}
