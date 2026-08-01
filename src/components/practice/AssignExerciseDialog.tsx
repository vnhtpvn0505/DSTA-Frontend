'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { practiceService } from '@/features/practice/practice.service'
import { userService } from '@/features/user/user.service'
import axiosInstance from '@/lib/axios'

interface ClassOption {
  id: number
  name: string
}

async function fetchClasses(): Promise<ClassOption[]> {
  const res = await axiosInstance.get<unknown>('/user/classes', { params: { page: 1, limit: 100 } })
  const data = res.data as Record<string, unknown>
  const inner = data?.data as Record<string, unknown> | undefined
  const rawList =
    (Array.isArray(inner?.items) ? inner?.items : null) ??
    (Array.isArray(inner?.rows) ? inner?.rows : null) ??
    (Array.isArray(inner?.content) ? inner?.content : null) ??
    (Array.isArray(inner) ? inner : null) ??
    []
  return (rawList as { id: number; name?: string; className?: string }[]).map((c) => ({
    id: c.id,
    name: c.name ?? c.className ?? `Lớp #${c.id}`,
  }))
}

interface AssignExerciseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exerciseId: number
  onSuccess?: () => void
}

export default function AssignExerciseDialog({
  open,
  onOpenChange,
  exerciseId,
  onSuccess,
}: AssignExerciseDialogProps) {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<'class' | 'students'>('class')
  const [classId, setClassId] = useState<number | ''>('')
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([])
  const [dueDate, setDueDate] = useState('')

  const { data: classes = [] } = useQuery({
    queryKey: ['user-classes'],
    queryFn: fetchClasses,
    enabled: open && mode === 'class',
  })

  const { data: studentsData } = useQuery({
    queryKey: ['user-students-for-assign'],
    queryFn: () => userService.getStudents(1, 100),
    enabled: open && mode === 'students',
  })
  const students = studentsData?.rows ?? []

  const mutation = useMutation({
    mutationFn: () =>
      practiceService.assignExercise(exerciseId, {
        classId: mode === 'class' && classId !== '' ? Number(classId) : undefined,
        userIds: mode === 'students' && selectedStudentIds.length > 0 ? selectedStudentIds : undefined,
        dueDate: dueDate || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-assignments', exerciseId] })
      setClassId('')
      setSelectedStudentIds([])
      setDueDate('')
      onOpenChange(false)
      onSuccess?.()
    },
  })

  const toggleStudent = (id: number) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  const canSubmit =
    (mode === 'class' && classId !== '') || (mode === 'students' && selectedStudentIds.length > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Phân công bài luyện tập</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {mutation.isError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              Không thể phân công. Vui lòng thử lại.
            </div>
          )}

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                checked={mode === 'class'}
                onChange={() => setMode('class')}
              />
              Theo lớp
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                checked={mode === 'students'}
                onChange={() => setMode('students')}
              />
              Theo sinh viên
            </label>
          </div>

          {mode === 'class' ? (
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
            >
              <option value="">Chọn lớp</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-2">
              {students.length === 0 ? (
                <p className="p-2 text-sm text-gray-500">Không có sinh viên.</p>
              ) : (
                students.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(Number(s.id))}
                      onChange={() => toggleStudent(Number(s.id))}
                    />
                    {s.studentName} ({s.mssv})
                  </label>
                ))
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Hạn nộp (tùy chọn)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            type="button"
            disabled={!canSubmit || mutation.isPending}
            onClick={() => mutation.mutate()}
            className="bg-[#00284D] hover:bg-[#001a33]"
          >
            {mutation.isPending ? 'Đang phân công...' : 'Phân công'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
