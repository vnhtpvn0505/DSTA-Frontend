'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Copy, Pencil, Plus, Power, PowerOff, Send, Trash2 } from 'lucide-react'
import RoleGuard from '@/components/common/RoleGuard'
import { Button } from '@/components/ui/button'
import ExerciseFormDialog from '@/components/practice/ExerciseFormDialog'
import { practiceService } from '@/features/practice/practice.service'
import type { PracticeExercise, PracticeExerciseStatus } from '@/types/practice'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<PracticeExerciseStatus, string> = {
  draft: 'Nháp',
  pending_review: 'Chờ thẩm định',
  rejected: 'Bị từ chối',
  approved: 'Đã phê duyệt',
  published: 'Đã xuất bản',
  inactive: 'Ngừng sử dụng',
}

const STATUS_STYLES: Record<PracticeExerciseStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  pending_review: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-600',
  approved: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-600',
}

function PracticesListContent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<PracticeExercise | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PracticeExercise | null>(null)

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ['practice-exercises'],
    queryFn: practiceService.getExercises,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['practice-exercises'] })

  const publishMutation = useMutation({
    mutationFn: (id: number) => practiceService.publishExercise(id),
    onSuccess: invalidate,
  })
  const submitReviewMutation = useMutation({
    mutationFn: (id: number) => practiceService.submitForReview(id),
    onSuccess: invalidate,
  })
  const saveDraftMutation = useMutation({
    mutationFn: (id: number) => practiceService.saveDraftExercise(id),
    onSuccess: invalidate,
  })
  const deactivateMutation = useMutation({
    mutationFn: (id: number) => practiceService.deactivateExercise(id),
    onSuccess: invalidate,
  })
  const duplicateMutation = useMutation({
    mutationFn: (id: number) => practiceService.duplicateExercise(id),
    onSuccess: invalidate,
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => practiceService.deleteExercise(id),
    onSuccess: () => {
      invalidate()
      setDeleteTarget(null)
    },
  })

  const openCreate = () => {
    setEditTarget(null)
    setFormOpen(true)
  }

  const openEdit = (exercise: PracticeExercise) => {
    setEditTarget(exercise)
    setFormOpen(true)
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý luyện tập</h1>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-[#00284D] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#001a33] cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Tạo bài luyện tập
        </button>
      </div>

      <ExerciseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        exercise={editTarget}
      />

      <div className="overflow-hidden rounded-2xl bg-white shadow-md">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00284D] border-t-transparent" />
          </div>
        ) : exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
            <p>Chưa có bài luyện tập nào. Tạo mới để bắt đầu.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-[#00284D]">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                    Số câu / Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {exercises.map((ex) => (
                  <tr key={ex.id} className="transition-colors hover:bg-gray-50/80">
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
                      {ex.config.questionCount} câu · {ex.config.questionTypes.join(', ')}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                          STATUS_STYLES[ex.status],
                        )}
                      >
                        {STATUS_LABELS[ex.status]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(ex)}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-blue-500 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                          aria-label="Sửa"
                          title="Sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateMutation.mutate(ex.id)}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                          aria-label="Sao chép"
                          title="Sao chép"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        {(ex.status === 'draft' || ex.status === 'rejected') && (
                          <button
                            type="button"
                            onClick={() => submitReviewMutation.mutate(ex.id)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-purple-600 hover:bg-purple-50 cursor-pointer"
                            aria-label="Gửi thẩm định"
                            title="Gửi thẩm định"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                        {ex.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => publishMutation.mutate(ex.id)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-green-600 hover:bg-green-50 cursor-pointer"
                            aria-label="Xuất bản"
                            title="Xuất bản"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                        {ex.status === 'published' && (
                          <button
                            type="button"
                            onClick={() => saveDraftMutation.mutate(ex.id)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-amber-600 hover:bg-amber-50 cursor-pointer"
                            aria-label="Chuyển về nháp"
                            title="Chuyển về nháp"
                          >
                            <Power className="h-4 w-4" />
                          </button>
                        )}
                        {ex.status !== 'inactive' && (
                          <button
                            type="button"
                            onClick={() => deactivateMutation.mutate(ex.id)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-orange-600 hover:bg-orange-50 cursor-pointer"
                            aria-label="Ngừng sử dụng"
                            title="Ngừng sử dụng"
                          >
                            <PowerOff className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(ex)}
                          disabled={ex.status === 'published'}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                          aria-label="Xóa"
                          title={ex.status === 'published' ? 'Ngừng sử dụng trước khi xóa' : 'Xóa'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">Xóa bài luyện tập</h3>
            <p className="mt-2 text-sm text-gray-600">
              Bạn có chắc muốn xóa &quot;{deleteTarget.title}&quot;? Hành động này không thể hoàn tác.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Hủy
              </Button>
              <Button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PracticesPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <PracticesListContent />
    </RoleGuard>
  )
}
