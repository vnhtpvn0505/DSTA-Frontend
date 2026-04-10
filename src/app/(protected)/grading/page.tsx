'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import RoleGuard from '@/components/common/RoleGuard'
import { gradingService, type SaPendingExamItem, type AdminUser } from '@/features/exam/grading.service'
import { Button } from '@/components/ui/button'
import { ClipboardList, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatDate(iso: string) {
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

function GradingListContent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [assigningId, setAssigningId] = useState<number | null>(null)

  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ['grading-pending'],
    queryFn: gradingService.getPendingExams,
  })

  const { data: admins = [] } = useQuery<AdminUser[]>({
    queryKey: ['grading-admins'],
    queryFn: gradingService.getAdmins,
  })

  const { mutate: assignGrader, isPending: assigning } = useMutation({
    mutationFn: ({ id, graderId }: { id: number; graderId: number }) =>
      gradingService.assignGrader(id, graderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading-pending'] })
      setAssigningId(null)
    },
  })

  return (
    <main className="min-h-screen bg-[#E8F4FF]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-main" />
          <div>
            <h1 className="text-2xl font-bold text-main sm:text-3xl">Chấm điểm tự luận</h1>
            <p className="mt-1 text-sm text-gray-500">Danh sách bài thi đang chờ chấm điểm tự luận</p>
          </div>
          <span className="ml-auto rounded-full bg-orange-100 text-orange-700 text-sm font-semibold px-3 py-1">
            {exams.length} bài chờ chấm
          </span>
        </div>

        <div className="rounded-2xl bg-white shadow-sm border border-blue-100 overflow-hidden">
          {examsLoading ? (
            <div className="flex items-center justify-center h-48 text-gray-500">Đang tải...</div>
          ) : exams.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
              <ClipboardList className="h-10 w-10 opacity-40" />
              <p>Không có bài thi nào đang chờ chấm điểm</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f0f7ff] border-b border-blue-100">
                    <th className="px-4 py-3 text-left font-semibold text-main">Sinh viên</th>
                    <th className="px-4 py-3 text-left font-semibold text-main">Email</th>
                    <th className="px-4 py-3 text-center font-semibold text-main">Điểm TN</th>
                    <th className="px-4 py-3 text-center font-semibold text-main">Số câu TL</th>
                    <th className="px-4 py-3 text-left font-semibold text-main">Ngày nộp</th>
                    <th className="px-4 py-3 text-left font-semibold text-main">Người chấm</th>
                    <th className="px-4 py-3 text-center font-semibold text-main">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam: SaPendingExamItem) => (
                    <tr key={exam.id} className="border-b border-gray-50 hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{exam.studentName}</td>
                      <td className="px-4 py-3 text-gray-500">{exam.studentEmail}</td>
                      <td className="px-4 py-3 text-center font-semibold text-blue-700">{exam.mcScore}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded-full bg-orange-50 text-orange-600 border border-orange-200 text-xs px-2 py-0.5">
                          {exam.saQuestionCount} câu
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(exam.submittedAt)}</td>
                      <td className="px-4 py-3">
                        {assigningId === exam.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              className="border border-gray-200 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-main"
                              defaultValue=""
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                const val = Number(e.target.value)
                                if (val) assignGrader({ id: exam.id, graderId: val })
                              }}
                              disabled={assigning}
                            >
                              <option value="" disabled>Chọn người chấm</option>
                              {admins.map((a) => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                              ))}
                            </select>
                            <button
                              className="text-xs text-gray-400 hover:text-gray-600"
                              onClick={() => setAssigningId(null)}
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            className={cn(
                              'flex items-center gap-1 text-sm rounded-md px-2 py-1 transition-colors',
                              exam.graderName
                                ? 'text-green-700 bg-green-50 hover:bg-green-100'
                                : 'text-orange-600 bg-orange-50 hover:bg-orange-100',
                            )}
                            onClick={() => setAssigningId(exam.id)}
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            {exam.graderName ?? 'Chưa phân công'}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          size="sm"
                          className="bg-main hover:bg-main/90 text-white text-xs h-8"
                          onClick={() => router.push(`/grading/${exam.id}`)}
                        >
                          Chấm điểm
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default function GradingPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <GradingListContent />
    </RoleGuard>
  )
}
