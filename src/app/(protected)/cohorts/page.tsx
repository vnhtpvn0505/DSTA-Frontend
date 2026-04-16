'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'
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
import type { CohortItem, CreateCohortPayload, UpdateCohortPayload } from '@/features/user/user.service'

const formSchema = z.object({
  name: z.string().min(1, 'Bắt buộc'),
  year: z.string().optional(),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function CohortsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<CohortItem | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['cohorts', page],
    queryFn: () => adminService.getCohorts(page, 20),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['cohorts'] })

  const createMutation = useMutation({
    mutationFn: (payload: CreateCohortPayload) => adminService.createCohort(payload),
    onSuccess: () => { invalidate(); setShowCreate(false) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCohortPayload }) =>
      adminService.updateCohort(id, payload),
    onSuccess: () => { invalidate(); setEditTarget(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteCohort(id),
    onSuccess: () => { invalidate(); setDeleteId(null) },
  })

  const createForm = useForm<FormValues>({ resolver: zodResolver(formSchema) })
  const editForm = useForm<FormValues>({ resolver: zodResolver(formSchema) })

  const openEdit = (c: CohortItem) => {
    setEditTarget(c)
    editForm.reset({ name: c.name, year: c.year ?? '', description: c.description ?? '' })
  }

  const FormFields = ({ form }: { form: ReturnType<typeof useForm<FormValues>> }) => (
    <>
      <div>
        <Label>Tên khoá</Label>
        <Input {...form.register('name')} className="mt-1" />
        {form.formState.errors.name && (
          <p className="mt-1 text-xs text-red-500">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div>
        <Label>Năm</Label>
        <Input {...form.register('year')} className="mt-1" />
      </div>
      <div>
        <Label>Mô tả</Label>
        <textarea {...form.register('description')} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={3} />
      </div>
    </>
  )

  const items = data?.items ?? []
  const totalPages = data?.pagination?.totalPages ?? 1

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-[#00284D]" />
          <h1 className="text-2xl font-bold text-gray-900">Quản lý khoá đào tạo</h1>
        </div>
        <Button onClick={() => { setShowCreate(true); createForm.reset() }}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm khoá
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
                <th className="px-4 py-3">Tên khoá</th>
                <th className="px-4 py-3">Năm</th>
                <th className="px-4 py-3">Mô tả</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-400">Chưa có khoá nào</td>
                </tr>
              ) : (
                items.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.year ?? '—'}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-gray-600">{c.description ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(c.id)}>
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

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Thêm khoá mới</DialogTitle></DialogHeader>
          <form
            onSubmit={createForm.handleSubmit((v) =>
              createMutation.mutate({ name: v.name, year: v.year || undefined, description: v.description || undefined }),
            )}
            className="space-y-4 py-2"
          >
            <FormFields form={createForm} />
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Đang lưu…' : 'Lưu'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Chỉnh sửa khoá</DialogTitle></DialogHeader>
          <form
            onSubmit={editForm.handleSubmit((v) => {
              if (!editTarget) return
              updateMutation.mutate({ id: editTarget.id, payload: v })
            })}
            className="space-y-4 py-2"
          >
            <FormFields form={editForm} />
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
        title="Xoá khoá đào tạo"
        description="Bạn có chắc chắn muốn xoá khoá này không?"
        confirmText="Xoá"
        cancelText="Hủy"
        variant="destructive"
        onConfirm={() => deleteId !== null && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
