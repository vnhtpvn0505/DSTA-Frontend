'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Pencil, Plus, Trash2, UserPlus } from 'lucide-react'
import RoleGuard from '@/components/common/RoleGuard'
import PracticeQuestionDialog from '@/components/practice/PracticeQuestionDialog'
import AssignExerciseDialog from '@/components/practice/AssignExerciseDialog'
import { practiceService } from '@/features/practice/practice.service'
import type { PracticeQuestion } from '@/types/practice'

type DetailTab = 'questions' | 'assign' | 'error-report'

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'questions', label: 'Câu hỏi' },
  { id: 'assign', label: 'Phân công' },
  { id: 'error-report', label: 'Báo cáo lỗi sai' },
]

function PracticeDetailContent() {
  const params = useParams()
  const router = useRouter()
  const exerciseId = Number(params?.id)
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<DetailTab>('questions')
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false)
  const [editQuestion, setEditQuestion] = useState<PracticeQuestion | null>(null)
  const [deleteQuestion, setDeleteQuestion] = useState<PracticeQuestion | null>(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [assignSuccessMsg, setAssignSuccessMsg] = useState('')

  const { data: exercise } = useQuery({
    queryKey: ['practice-exercise', exerciseId],
    queryFn: () => practiceService.getExerciseById(exerciseId),
    enabled: Number.isFinite(exerciseId),
  })

  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['practice-questions', exerciseId],
    queryFn: () => practiceService.getQuestions(exerciseId),
    enabled: Number.isFinite(exerciseId) && activeTab === 'questions',
  })

  const { data: errorReport = [], isLoading: reportLoading } = useQuery({
    queryKey: ['practice-error-report', exerciseId],
    queryFn: () => practiceService.getErrorReport(exerciseId),
    enabled: Number.isFinite(exerciseId) && activeTab === 'error-report',
  })

  const deleteMutation = useMutation({
    mutationFn: (questionId: number) => practiceService.deleteQuestion(exerciseId, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-questions', exerciseId] })
      setDeleteQuestion(null)
    },
  })

  if (!Number.isFinite(exerciseId)) return null

  return (
    <div className="p-6">
      <button
        type="button"
        onClick={() => router.push('/practices')}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách
      </button>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {exercise?.title ?? 'Bài luyện tập'}
      </h1>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-[#00284D] text-[#00284D]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'questions' && (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setEditQuestion(null)
                setQuestionDialogOpen(true)
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00284D] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#001a33] cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              Thêm câu hỏi
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-md">
            {questionsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00284D] border-t-transparent" />
              </div>
            ) : questions.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-500">Chưa có câu hỏi nào.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-[#00284D]">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                      Nội dung
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                      Số đáp án
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {questions.map((q) => (
                    <tr key={q.id} className="hover:bg-gray-50/80">
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            q.type === 'mc' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {q.type === 'mc' ? 'Trắc nghiệm' : 'Tự luận'}
                        </span>
                      </td>
                      <td className="max-w-md px-6 py-4 text-sm text-gray-700">{q.content}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                        {q.type === 'mc' ? (q.options?.length ?? 0) : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditQuestion(q)
                              setQuestionDialogOpen(true)
                            }}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-blue-500 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                            aria-label="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteQuestion(q)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                            aria-label="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <PracticeQuestionDialog
            open={questionDialogOpen}
            onOpenChange={setQuestionDialogOpen}
            exerciseId={exerciseId}
            question={editQuestion}
          />

          {deleteQuestion && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="text-base font-semibold text-gray-900">Xóa câu hỏi</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Bạn có chắc muốn xóa câu hỏi này? Hành động này không thể hoàn tác.
                </p>
                <div className="mt-5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteQuestion(null)}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(deleteQuestion.id)}
                    disabled={deleteMutation.isPending}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'assign' && (
        <div className="rounded-2xl bg-white p-8 shadow-md">
          <p className="mb-4 text-sm text-gray-600">
            Phân công bài luyện tập này cho một lớp hoặc danh sách sinh viên cụ thể. Sinh viên chỉ
            thấy được bài khi bài đã ở trạng thái &quot;Đã xuất bản&quot;.
          </p>
          {assignSuccessMsg && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {assignSuccessMsg}
            </div>
          )}
          <button
            type="button"
            onClick={() => setAssignDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00284D] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#001a33] cursor-pointer"
          >
            <UserPlus className="h-5 w-5" />
            Phân công
          </button>

          <AssignExerciseDialog
            open={assignDialogOpen}
            onOpenChange={setAssignDialogOpen}
            exerciseId={exerciseId}
            onSuccess={() => setAssignSuccessMsg('Đã phân công thành công.')}
          />
        </div>
      )}

      {activeTab === 'error-report' && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-md">
          {reportLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00284D] border-t-transparent" />
            </div>
          ) : errorReport.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-500">
              Chưa có dữ liệu (chưa có sinh viên nào nộp bài).
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[#00284D]">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                    Câu hỏi
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white">
                    Số lần làm
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white">
                    Số lần sai
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white">
                    Tỷ lệ sai
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {errorReport.map((r) => (
                  <tr key={r.questionId} className="hover:bg-gray-50/80">
                    <td className="max-w-md px-6 py-4 text-sm text-gray-700">{r.content}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">{r.totalAttempts}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">{r.incorrectAttempts}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          r.errorRatePercent >= 50
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {r.errorRatePercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

export default function PracticeDetailPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <PracticeDetailContent />
    </RoleGuard>
  )
}
