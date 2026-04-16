'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react'
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
import { userService } from '@/features/user/user.service'
import type { TeacherItem, CreateTeacherPayload, UpdateTeacherPayload } from '@/features/user/user.service'

// ── Schemas ───────────────────────────────────────────────────────────────────

const createSchema = z.object({
  username: z.string().min(1, 'Bắt buộc'),
  firstName: z.string().min(1, 'Bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Tối thiểu 8 ký tự'),
  phoneNumber: z.string().optional(),
  facultyName: z.string().optional(),
})

const updateSchema = z.object({
  firstName: z.string().min(1, 'Bắt buộc').optional(),
  phoneNumber: z.string().optional(),
  facultyName: z.string().optional(),
})

type CreateFormValues = z.infer<typeof createSchema>
type UpdateFormValues = z.infer<typeof updateSchema>

// ── Component ─────────────────────────────────────────────────────────────────

export default function TeacherPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<TeacherItem | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['teachers', page],
    queryFn: () => userService.getTeachers(page, 20),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['teachers'] })

  const createMutation = useMutation({
    mutationFn: (payload: CreateTeacherPayload) => userService.createTeacher(payload),
    onSuccess: () => { invalidate(); setShowCreate(false) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTeacherPayload }) =>
      userService.updateTeacher(id, payload),
    onSuccess: () => { invalidate(); setEditTarget(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userService.deleteTeacher(id),
    onSuccess: () => { invalidate(); setDeleteId(null) },
  })

  // ── Create form ─────────────────────────────────────────────────────────────

  const createForm = useForm<CreateFormValues>({ resolver: zodResolver(createSchema) })

  const onCreateSubmit = (values: CreateFormValues) => {
    createMutation.mutate({
      username: values.username,
      firstName: values.firstName,
      email: values.email,
      password: values.password,
      phoneNumber: values.phoneNumber || undefined,
      facultyName: values.facultyName || undefined,
    })
  }

  // ── Edit form ───────────────────────────────────────────────────────────────

  const editForm = useForm<UpdateFormValues>({ resolver: zodResolver(updateSchema) })

  const openEdit = (teacher: TeacherItem) => {
    setEditTarget(teacher)
    editForm.reset({
      firstName: teacher.firstName,
      phoneNumber: teacher.phoneNumber ?? '',
      facultyName: teacher.facultyName ?? '',
    })
  }

  const onEditSubmit = (values: UpdateFormValues) => {
    if (!editTarget) return
    updateMutation.mutate({
      id: editTarget.id,
      payload: {
        firstName: values.firstName,
        phoneNumber: values.phoneNumber || undefined,
        facultyName: values.facultyName || undefined,
      },
    })
  }

  const items = data?.items ?? []
  const totalPages = data?.pagination?.totalPages ?? 1

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-7 w-7 text-[#00284D]" />
          <h1 className="text-2xl font-bold text-gray-900">Quản lý giảng viên</h1>
        </div>
        <Button onClick={() => { setShowCreate(true); createForm.reset() }}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm giảng viên
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
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Tên đăng nhập</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Số điện thoại</th>
                <th className="px-4 py-3">Khoa</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    Chưa có giảng viên nào
                  </td>
                </tr>
              ) : (
                items.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{t.firstName}</td>
                    <td className="px-4 py-3 text-gray-600">{t.username}</td>
                    <td className="px-4 py-3 text-gray-600">{t.email}</td>
                    <td className="px-4 py-3 text-gray-600">{t.phoneNumber ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{t.facultyName ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(t.id)}>
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
            <DialogTitle>Thêm giảng viên mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 py-2">
            {(
              [
                { name: 'username', label: 'Tên đăng nhập' },
                { name: 'firstName', label: 'Họ và tên' },
                { name: 'email', label: 'Email' },
                { name: 'password', label: 'Mật khẩu', type: 'password' },
                { name: 'phoneNumber', label: 'Số điện thoại' },
                { name: 'facultyName', label: 'Khoa / Bộ môn' },
              ] as Array<{ name: keyof CreateFormValues; label: string; type?: string }>
            ).map(({ name, label, type }) => (
              <div key={name}>
                <Label htmlFor={`create-${name}`}>{label}</Label>
                <Input
                  id={`create-${name}`}
                  type={type ?? 'text'}
                  {...createForm.register(name)}
                  className="mt-1"
                />
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
            <DialogTitle>Chỉnh sửa giảng viên</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-2">
            {(
              [
                { name: 'firstName', label: 'Họ và tên' },
                { name: 'phoneNumber', label: 'Số điện thoại' },
                { name: 'facultyName', label: 'Khoa / Bộ môn' },
              ] as const
            ).map(({ name, label }) => (
              <div key={name}>
                <Label htmlFor={`edit-${name}`}>{label}</Label>
                <Input id={`edit-${name}`} {...editForm.register(name)} className="mt-1" />
                {editForm.formState.errors[name] && (
                  <p className="mt-1 text-xs text-red-500">
                    {editForm.formState.errors[name]?.message}
                  </p>
                )}
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

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Xoá giảng viên"
        description="Bạn có chắc chắn muốn xoá giảng viên này không? Hành động này không thể hoàn tác."
        confirmText="Xoá"
        cancelText="Hủy"
        variant="destructive"
        onConfirm={() => deleteId !== null && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
