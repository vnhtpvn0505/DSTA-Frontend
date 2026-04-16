'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import Pagination from '@/components/dashboard/Pagination'
import { adminService } from '@/features/user/admin.service'
import type {
  ExamPeriodItem,
  ExamPeriodStatus,
  CreateExamPeriodPayload,
  UpdateExamPeriodPayload,
} from '@/features/user/user.service'

const STATUS_LABELS: Record<ExamPeriodStatus, string> = {
  scheduled: 'Chờ bắt đầu',
  active: 'Đang diễn ra',
  ended: 'Đã kết thúc',
}

const STATUS_COLORS: Record<ExamPeriodStatus, string> = {
  scheduled: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  ended: 'bg-gray-100 text-gray-600',
}

const createSchema = z.object({
  name: z.string().min(1, 'Bắt buộc'),
  startDate: z.string().min(1, 'Bắt buộc'),
  endDate: z.string().min(1, 'Bắt buộc'),
  examConfigId: z.number().int().positive().optional(),
})

const updateSchema = z.object({
  name: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  examConfigId: z.number().int().positive().optional(),
  status: z.enum(['scheduled', 'active', 'ended']).optional(),
})

type CreateFormValues = z.infer<typeof createSchema>
type UpdateFormValues = z.infer<typeof updateSchema>

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function toLocalDatetimeValue(iso: string) {
  // Convert ISO string to local datetime-local input value (YYYY-MM-DDTHH:mm)
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function ExamPeriodsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<ExamPeriodItem | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['exam-periods', page],
    queryFn: () => adminService.getExamPeriods(page, 20),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['exam-periods'] })

  const createMutation = useMutation({
    mutationFn: (payload: CreateExamPeriodPayload) => adminService.createExamPeriod(payload),
    onSuccess: () => { invalidate(); setShowCreate(false) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateExamPeriodPayload }) =>
      adminService.updateExamPeriod(id, payload),
    onSuccess: () => { invalidate(); setEditTarget(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteExamPeriod(id),
    onSuccess: () => { invalidate(); setDeleteId(null) },
  })

  const createForm = useForm<CreateFormValues>({ resolver: zodResolver(createSchema) })
  const editForm = useForm<UpdateFormValues>({ resolver: zodResolver(updateSchema) })

  const openEdit = (p: ExamPeriodItem) => {
    setEditTarget(p)
    editForm.reset({
      name: p.name,
      startDate: toLocalDatetimeValue(p.startDate),
      endDate: toLocalDatetimeValue(p.endDate),
      examConfigId: p.examConfigId ?? undefined,
      status: p.status,
    })
  }

  const items = data?.items ?? []
  const totalPages = data?.pagination?.totalPages ?? 1

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-7 w-7 text-[#00284D]" />
          <h1 className="text-2xl font-bold text-gray-900">Quản lý kỳ thi</h1>
        </div>
        <Button onClick={() => { setShowCreate(true); createForm.reset() }}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm kỳ thi
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00284D] border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Tên kỳ thi</th>
                <th className="px-4 py-3">Bắt đầu</th>
                <th className="px-4 py-3">Kết thúc</th>
                <th className="px-4 py-3">Cấu hình đề</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">Chưa có kỳ thi nào</td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">{fmt(p.startDate)}</td>
                    <td className="px-4 py-3 text-gray-600">{fmt(p.endDate)}</td>
                    <td className="px-4 py-3 text-gray-600">{p.examConfigId ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status]}`}>
                        {STATUS_LABELS[p.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(p.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Thêm kỳ thi mới</DialogTitle></DialogHeader>
          <form
            onSubmit={createForm.handleSubmit((v) =>
              createMutation.mutate({
                name: v.name,
                startDate: new Date(v.startDate).toISOString(),
                endDate: new Date(v.endDate).toISOString(),
                examConfigId: v.examConfigId,
              }),
            )}
            className="space-y-4 py-2"
          >
            <div>
              <Label>Tên kỳ thi</Label>
              <Input {...createForm.register('name')} className="mt-1" />
              {createForm.formState.errors.name && (
                <p className="mt-1 text-xs text-red-500">{createForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ngày bắt đầu</Label>
                <Input type="datetime-local" {...createForm.register('startDate')} className="mt-1" />
              </div>
              <div>
                <Label>Ngày kết thúc</Label>
                <Input type="datetime-local" {...createForm.register('endDate')} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>ID cấu hình đề (tuỳ chọn)</Label>
              <Input type="number" {...createForm.register('examConfigId', { valueAsNumber: true })} className="mt-1" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Đang lưu…' : 'Lưu'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Chỉnh sửa kỳ thi</DialogTitle></DialogHeader>
          <form
            onSubmit={editForm.handleSubmit((v) => {
              if (!editTarget) return
              updateMutation.mutate({
                id: editTarget.id,
                payload: {
                  ...v,
                  startDate: v.startDate ? new Date(v.startDate).toISOString() : undefined,
                  endDate: v.endDate ? new Date(v.endDate).toISOString() : undefined,
                },
              })
            })}
            className="space-y-4 py-2"
          >
            <div>
              <Label>Tên kỳ thi</Label>
              <Input {...editForm.register('name')} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ngày bắt đầu</Label>
                <Input type="datetime-local" {...editForm.register('startDate')} className="mt-1" />
              </div>
              <div>
                <Label>Ngày kết thúc</Label>
                <Input type="datetime-local" {...editForm.register('endDate')} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>ID cấu hình đề</Label>
              <Input type="number" {...editForm.register('examConfigId', { valueAsNumber: true })} className="mt-1" />
            </div>
            <div>
              <Label>Trạng thái</Label>
              <select {...editForm.register('status')} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="scheduled">Chờ bắt đầu</option>
                <option value="active">Đang diễn ra</option>
                <option value="ended">Đã kết thúc</option>
              </select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Hủy</Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Đang lưu…' : 'Lưu'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Xoá kỳ thi"
        description="Bạn có chắc chắn muốn xoá kỳ thi này không?"
        confirmText="Xoá"
        cancelText="Hủy"
        variant="destructive"
        onConfirm={() => deleteId !== null && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
