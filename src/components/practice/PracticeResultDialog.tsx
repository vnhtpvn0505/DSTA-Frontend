'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { quizService } from '@/features/quiz/quiz.service'
import { practiceService } from '@/features/practice/practice.service'
import type { SubmitPracticeAttemptResult } from '@/types/practice'

interface PracticeResultDialogProps {
  open: boolean
  result: SubmitPracticeAttemptResult | null
  onClose: () => void
}

export default function PracticeResultDialog({ open, result, onClose }: PracticeResultDialogProps) {
  const { data: categories = [] } = useQuery({
    queryKey: ['quiz-categories'],
    queryFn: quizService.getCategories,
    enabled: open,
  })
  const { data: skills = [] } = useQuery({
    queryKey: ['practice-skills'],
    queryFn: practiceService.getSkills,
    enabled: open,
  })

  if (!result) return null

  const hasBreakdown =
    (result.breakdown?.byCategory?.length ?? 0) > 0 || (result.breakdown?.bySkill?.length ?? 0) > 0

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kết quả luyện tập</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-2 py-4">
          <p
            className={`text-4xl font-extrabold ${result.isPassed ? 'text-green-600' : 'text-red-500'}`}
          >
            {result.score}%
          </p>
          <p className="text-sm text-gray-500">Điểm đạt yêu cầu: {result.passingScore}%</p>
          <span
            className={`mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
              result.isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            }`}
          >
            {result.isPassed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {result.isPassed ? 'Đạt' : 'Chưa đạt'}
          </span>
        </div>

        {hasBreakdown && (
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            {result.breakdown.byCategory.length > 0 && (
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="mb-1.5 text-xs font-semibold text-gray-500">Theo miền năng lực</p>
                <div className="space-y-1">
                  {result.breakdown.byCategory.map((g) => (
                    <div key={g.id} className="flex justify-between text-xs text-gray-700">
                      <span>{categories.find((c) => c.id === g.id)?.name ?? `#${g.id}`}</span>
                      <span className="font-medium">{g.correct}/{g.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.breakdown.bySkill.length > 0 && (
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="mb-1.5 text-xs font-semibold text-gray-500">Theo kỹ năng</p>
                <div className="space-y-1">
                  {result.breakdown.bySkill.map((g) => (
                    <div key={g.id} className="flex justify-between text-xs text-gray-700">
                      <span>{skills.find((s) => s.id === g.id)?.name ?? `#${g.id}`}</span>
                      <span className="font-medium">{g.correct}/{g.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {result.feedback.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-900">Chi tiết từng câu</p>
            {result.feedback.map((f, i) => (
              <div
                key={f.questionId}
                className={`rounded-xl border p-3 text-sm ${
                  f.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="mb-1 flex items-center gap-2 font-medium">
                  {f.isCorrect ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  Câu {i + 1}
                </div>
                {f.explanation && <p className="text-gray-700">{f.explanation}</p>}
                {f.solution && <p className="mt-1 text-gray-500">Lời giải: {f.solution}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500">
            Bài luyện tập này không hiển thị đáp án/lời giải chi tiết.
          </p>
        )}

        <DialogFooter className="pt-4">
          <Button onClick={onClose} className="w-full bg-main hover:bg-[#002244]">
            Quay lại danh sách
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
