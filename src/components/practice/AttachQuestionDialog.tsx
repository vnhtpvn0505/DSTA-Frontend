'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { practiceService } from '@/features/practice/practice.service'

interface AttachQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exerciseId: number
  onSuccess?: () => void
}

export default function AttachQuestionDialog({
  open,
  onOpenChange,
  exerciseId,
  onSuccess,
}: AttachQuestionDialogProps) {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['practice-question-bank', search],
    queryFn: () => practiceService.searchQuestionBank({ search: search || undefined }),
    enabled: open,
  })

  const attachMutation = useMutation({
    mutationFn: (questionId: number) => practiceService.attachQuestion(exerciseId, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-questions', exerciseId] })
      onSuccess?.()
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gắn câu hỏi từ ngân hàng</DialogTitle>
        </DialogHeader>

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo nội dung câu hỏi..."
          className="mb-3"
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00284D] border-t-transparent" />
          </div>
        ) : questions.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">Không tìm thấy câu hỏi nào.</p>
        ) : (
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {questions.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-gray-900">{q.content}</p>
                  <p className="text-xs text-gray-400">
                    {q.type === 'mc' ? 'Trắc nghiệm' : 'Tự luận'}
                  </p>
                </div>
                <Button
                  size="sm"
                  disabled={attachMutation.isPending}
                  onClick={() => attachMutation.mutate(q.id)}
                  className="shrink-0 bg-[#00284D] hover:bg-[#001a33]"
                >
                  Gắn vào bài
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
