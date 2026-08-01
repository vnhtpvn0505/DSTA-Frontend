'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Copy, Eye, Pencil, Plus, Power, PowerOff, Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ExamConfigPreviewDialog from './ExamConfigPreviewDialog'
import { quizService } from '@/features/quiz/quiz.service'
import type { ExamConfig, ExamConfigStatus } from '@/types/quiz'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<ExamConfigStatus, string> = {
  draft: 'Nháp',
  published: 'Đã xuất bản',
  inactive: 'Ngừng sử dụng',
}

const STATUS_STYLES: Record<ExamConfigStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  published: 'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-600',
}

interface ExamConfigListTableProps {
  onSelect: (id: number) => void
  onCreateNew: () => void
}

export default function ExamConfigListTable({ onSelect, onCreateNew }: ExamConfigListTableProps) {
  const queryClient = useQueryClient()
  const [previewId, setPreviewId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ExamConfig | null>(null)

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['exam-configs'],
    queryFn: quizService.getExamConfigs,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['exam-configs'] })

  const publishMutation = useMutation({
    mutationFn: (id: number) => quizService.publishExamConfig(id),
    onSuccess: invalidate,
  })
  const saveDraftMutation = useMutation({
    mutationFn: (id: number) => quizService.saveDraftExamConfig(id),
    onSuccess: invalidate,
  })
  const deactivateMutation = useMutation({
    mutationFn: (id: number) => quizService.deactivateExamConfig(id),
    onSuccess: invalidate,
  })
  const duplicateMutation = useMutation({
    mutationFn: (id: number) => quizService.duplicateExamConfig(id),
    onSuccess: invalidate,
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => quizService.deleteExamConfig(id),
    onSuccess: () => {
      invalidate()
      setDeleteTarget(null)
    },
  })

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 rounded-xl bg-[#00284D] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#001a33] cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Tạo cấu hình mới
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-md">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00284D] border-t-transparent" />
          </div>
        ) : configs.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">Chưa có cấu hình đề thi nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-[#00284D]">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                    Tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                    Chế độ
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
                {configs.map((cfg) => (
                  <tr key={cfg.id} className="transition-colors hover:bg-gray-50/80">
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => onSelect(cfg.id)}
                        className="text-sm font-medium text-[#00284D] hover:underline cursor-pointer"
                      >
                        {cfg.name}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {cfg.examMode === 'standard' ? 'Chuẩn' : 'Tùy chỉnh'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                          STATUS_STYLES[cfg.status] ?? STATUS_STYLES.draft,
                        )}
                      >
                        {STATUS_LABELS[cfg.status] ?? cfg.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onSelect(cfg.id)}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-blue-500 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                          aria-label="Sửa"
                          title="Sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewId(cfg.id)}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-purple-600 hover:bg-purple-50 cursor-pointer"
                          aria-label="Xem trước"
                          title="Xem trước"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateMutation.mutate(cfg.id)}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                          aria-label="Sao chép"
                          title="Sao chép"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        {cfg.status !== 'published' && (
                          <button
                            type="button"
                            onClick={() => publishMutation.mutate(cfg.id)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-green-600 hover:bg-green-50 cursor-pointer"
                            aria-label="Xuất bản"
                            title="Xuất bản"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                        {cfg.status === 'published' && (
                          <button
                            type="button"
                            onClick={() => saveDraftMutation.mutate(cfg.id)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-amber-600 hover:bg-amber-50 cursor-pointer"
                            aria-label="Chuyển về nháp"
                            title="Chuyển về nháp"
                          >
                            <Power className="h-4 w-4" />
                          </button>
                        )}
                        {cfg.status !== 'inactive' && (
                          <button
                            type="button"
                            onClick={() => deactivateMutation.mutate(cfg.id)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-orange-600 hover:bg-orange-50 cursor-pointer"
                            aria-label="Ngừng sử dụng"
                            title="Ngừng sử dụng"
                          >
                            <PowerOff className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(cfg)}
                          disabled={cfg.status === 'published'}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                          aria-label="Xóa"
                          title={cfg.status === 'published' ? 'Ngừng sử dụng trước khi xóa' : 'Xóa'}
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

      <ExamConfigPreviewDialog
        open={previewId != null}
        configId={previewId}
        onOpenChange={(open) => !open && setPreviewId(null)}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">Xóa cấu hình đề thi</h3>
            <p className="mt-2 text-sm text-gray-600">
              Bạn có chắc muốn xóa &quot;{deleteTarget.name}&quot;? Hành động này không thể hoàn tác.
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
