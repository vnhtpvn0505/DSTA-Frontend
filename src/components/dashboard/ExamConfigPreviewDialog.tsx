'use client'

import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { quizService } from '@/features/quiz/quiz.service'

interface ExamConfigPreviewDialogProps {
  open: boolean
  configId: number | null
  onOpenChange: (open: boolean) => void
}

export default function ExamConfigPreviewDialog({
  open,
  configId,
  onOpenChange,
}: ExamConfigPreviewDialogProps) {
  const { data: preview, isLoading } = useQuery({
    queryKey: ['exam-config-preview', configId],
    queryFn: () => quizService.previewExamConfig(configId!),
    enabled: open && configId != null,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Xem trước cấu trúc đề thi</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00284D] border-t-transparent" />
          </div>
        ) : !preview ? (
          <p className="py-6 text-center text-sm text-gray-500">Không tải được dữ liệu xem trước.</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 rounded-xl border border-gray-200 p-4 text-sm">
              <div>
                <p className="text-gray-500">Tổng điểm TN</p>
                <p className="font-semibold text-gray-900">{preview.generalConfig.totalMultipleChoice}</p>
              </div>
              <div>
                <p className="text-gray-500">Tổng điểm TL</p>
                <p className="font-semibold text-gray-900">{preview.generalConfig.totalEssay}</p>
              </div>
              <div>
                <p className="text-gray-500">Thời gian</p>
                <p className="font-semibold text-gray-900">{preview.generalConfig.durationMinutes} phút</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-gray-900">
                Câu hỏi mẫu ({preview.sampleQuestions.length})
              </p>
              {preview.sampleQuestions.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Không có câu hỏi mẫu — kiểm tra ngân hàng câu hỏi có đủ dữ liệu theo phân bổ không.
                </p>
              ) : (
                <div className="space-y-2">
                  {preview.sampleQuestions.map((sq, i) => (
                    <div key={i} className="rounded-lg border border-gray-200 p-3 text-sm">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {sq.skillName}
                        </span>
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                          {sq.level}
                        </span>
                      </div>
                      <p className="text-gray-800">{sq.question.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
