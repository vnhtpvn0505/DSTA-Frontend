'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, ClipboardList, XCircle } from 'lucide-react'
import RoleGuard from '@/components/common/RoleGuard'
import { Button } from '@/components/ui/button'
import { practiceService } from '@/features/practice/practice.service'
import type { PracticeExercise } from '@/types/practice'

function formatDate(iso?: string | null) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function PracticeReviewContent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [rejectTarget, setRejectTarget] = useState<PracticeExercise | null>(null)
  const [reason, setReason] = useState('')

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ['practice-pending-review'],
    queryFn: practiceService.getPendingReviewExercises,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['practice-pending-review'] })

  const approveMutation = useMutation({
    mutationFn: (id: number) => practiceService.approveExercise(id),
    onSuccess: invalidate,
  })
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      practiceService.rejectExercise(id, reason),
    onSuccess: () => {
      invalidate()
      setRejectTarget(null)
      setReason('')
    },
  })

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <ClipboardList className="h-8 w-8 text-[#00284D]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thẩm định bài luyện tập</h1>
          <p className="mt-1 text-sm text-gray-500">
            Danh sách bài luyện tập đang chờ bạn phê duyệt hoặc từ chối.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-md">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00284D] border-t-transparent" />
          </div>
        ) : exercises.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">
            Không có bài luyện tập nào đang chờ thẩm định.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-[#00284D]">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                    Gửi lúc
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {exercises.map((ex) => (
                  <tr key={ex.id} className="hover:bg-gray-50/80">
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => router.push(`/practices/${ex.id}`)}
                        className="text-sm font-medium text-[#00284D] hover:underline cursor-pointer"
                      >
                        {ex.title}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {formatDate(ex.submittedForReviewAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          disabled={approveMutation.isPending}
                          onClick={() => approveMutation.mutate(ex.id)}
                          className="gap-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Phê duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRejectTarget(ex)}
                          className="gap-1 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Từ chối
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">
              Từ chối &quot;{rejectTarget.title}&quot;
            </h3>
            <p className="mt-2 text-sm text-gray-600">Nhập lý do từ chối để giảng viên chỉnh sửa lại.</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
              placeholder="Vd: Câu 3 thiếu đáp án đúng, cần bổ sung."
            />
            <div className="mt-5 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectTarget(null)
                  setReason('')
                }}
              >
                Hủy
              </Button>
              <Button
                disabled={!reason.trim() || rejectMutation.isPending}
                onClick={() => rejectMutation.mutate({ id: rejectTarget.id, reason: reason.trim() })}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {rejectMutation.isPending ? 'Đang gửi...' : 'Từ chối'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PracticeReviewPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <PracticeReviewContent />
    </RoleGuard>
  )
}
