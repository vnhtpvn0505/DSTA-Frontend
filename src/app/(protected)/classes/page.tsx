'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, School } from 'lucide-react'
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
import type { ClassItem, CreateClassPayload, UpdateClassPayload } from '@/features/user/user.service'

// ── Schemas ───────────────────────────────────────────────────────────────────

const createSchema = z.object({
  name: z.string().min(1, 'Bắt buộc'),
  code: z.string().min(1, 'Bắt buộc'),
  academicYear: z.string().optional(),
})

const updateSchema = z.object({
  name: z.string().min(1, 'Bắt buộc').optional(),
  code: z.string().min(1, 'Bắt buộc').optional(),
  academicYear: z.string().optional(),
  isActive: z.boolean().optional(),
})

type CreateFormValues = z.infer<typeof createSchema>
type UpdateFormValues = z.infer<typeof updateSchema>

// ── Component ─────────────────────────────────────────────────────────────────

export default function ClassesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<ClassItem | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['classes', page],
    queryFn: () => adminService.getClasses(page, 20),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['classes'] })

  const createMutation = useMutation({
    mutationFn: (payload: CreateClassPayload) => adminService.createClass(payload),
    onSuccess: () => { invalidate(); setShowCreate(false) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateClassPayload }) =>
      adminService.updateClass(id, payload),
    onSuccess: () => { invalidate(); setEditTarget(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteClass(id),
    onSuccess: () => { invalidate(); setDeleteId(null) },
  })

  const createForm = useForm<CreateFormValues>({ resolver: zodResolver(createSchema) })
  const editForm = useForm<UpdateFormValues>({ resolver: zodResolver(updateSchema) })

  const openEdit = (cls: ClassItem) => {
    setEditTarget(cls)
    editForm.reset({ name: cls.name, code: cls.code, academicYear: cls.academicYear ?? '' })
  }

  const items = data?.items ?? []
  const totalPages = data?.pagination?.totalPages ?? 1

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <School className="h-7 w-7 text-[#00284D]" />
          <h1 className="text-2xl font-bold text-gray-900">Quản lý lớp học</h1>
        </div>
        <Button onClick={() => { setShowCreate(true); createForm.reset() }}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm lớp
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
                <th className="px-4 py-3">Tên lớp</th>
                <th className="px-4 py-3">Mã lớp</th>
                <th className="px-4 py-3">Năm học</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    Chưa có lớp nào
                  </td>
                </tr>
              ) : (
                items.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.code}</td>
                    <td className="px-4 py-3 text-gray-600">{c.academicYear ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          c.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {c.isActive ? 'Hoạt động' : 'Ngừng'}
                      </span>
                    </td>
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

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm lớp mới</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={createForm.handleSubmit((v) =>
              createMutation.mutate({
                name: v.name,
                code: v.code,
                academicYear: v.academicYear || undefined,
              }),
            )}
            className="space-y-4 py-2"
          >
            {([
              { name: 'name', label: 'Tên lớp' },
              { name: 'code', label: 'Mã lớp' },
              { name: 'academicYear', label: 'Năm học' },
            ] as const).map(({ name, label }) => (
              <div key={name}>
                <Label htmlFor={`create-${name}`}>{label}</Label>
                <Input id={`create-${name}`} {...createForm.register(name)} className="mt-1" />
                {createForm.formState.errors[name] && (
                  <p className="mt-1 text-xs text-red-500">
                    {createForm.formState.errors[name]?.message}
                  </p>
                )}
              </div>
            ))}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa lớp</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit((v) => {
              if (!editTarget) return
              updateMutation.mutate({ id: editTarget.id, payload: v })
            })}
            className="space-y-4 py-2"
          >
            {([
              { name: 'name', label: 'Tên lớp' },
              { name: 'code', label: 'Mã lớp' },
              { name: 'academicYear', label: 'Năm học' },
            ] as const).map(({ name, label }) => (
              <div key={name}>
                <Label htmlFor={`edit-${name}`}>{label}</Label>
                <Input id={`edit-${name}`} {...editForm.register(name)} className="mt-1" />
              </div>
            ))}
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
        title="Xoá lớp"
        description="Bạn có chắc chắn muốn xoá lớp này không?"
        confirmText="Xoá"
        cancelText="Hủy"
        variant="destructive"
        onConfirm={() => deleteId !== null && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
