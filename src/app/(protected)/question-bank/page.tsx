'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import RoleGuard from '@/components/common/RoleGuard'
import PracticeQuestionDialog from '@/components/practice/PracticeQuestionDialog'
import SkillFormDialog from '@/components/practice/SkillFormDialog'
import { practiceService } from '@/features/practice/practice.service'
import { quizService } from '@/features/quiz/quiz.service'
import type { PracticeQuestion, Skill } from '@/types/practice'

function QuestionBankContent() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [skillId, setSkillId] = useState<number | ''>('')
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false)
  const [editQuestion, setEditQuestion] = useState<PracticeQuestion | null>(null)
  const [deleteQuestion, setDeleteQuestion] = useState<PracticeQuestion | null>(null)
  const [skillDialogOpen, setSkillDialogOpen] = useState(false)
  const [editSkill, setEditSkill] = useState<Skill | null>(null)
  const [deleteSkillId, setDeleteSkillId] = useState<number | null>(null)

  const { data: categories = [] } = useQuery({
    queryKey: ['quiz-categories'],
    queryFn: quizService.getCategories,
  })
  const { data: skills = [] } = useQuery({
    queryKey: ['practice-skills'],
    queryFn: practiceService.getSkills,
  })

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['practice-question-bank', search, categoryId, skillId],
    queryFn: () =>
      practiceService.searchQuestionBank({
        search: search || undefined,
        categoryId: categoryId === '' ? undefined : categoryId,
        skillId: skillId === '' ? undefined : skillId,
      }),
  })

  const deleteQuestionMutation = useMutation({
    mutationFn: (id: number) => practiceService.deleteBankQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-question-bank'] })
      setDeleteQuestion(null)
    },
  })

  const deleteSkillMutation = useMutation({
    mutationFn: (id: number) => practiceService.deleteSkill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-skills'] })
      setDeleteSkillId(null)
    },
  })

  const categoryName = (id?: number | null) => categories.find((c) => c.id === id)?.name ?? '—'
  const skillName = (id?: number | null) => skills.find((s) => s.id === id)?.name ?? '—'

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ngân hàng câu hỏi</h1>
        <button
          type="button"
          onClick={() => {
            setEditQuestion(null)
            setQuestionDialogOpen(true)
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#00284D] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#001a33] cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Tạo câu hỏi
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo nội dung câu hỏi..."
            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
          />
        </div>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
        >
          <option value="">Tất cả miền năng lực</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={skillId}
          onChange={(e) => setSkillId(e.target.value === '' ? '' : Number(e.target.value))}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
        >
          <option value="">Tất cả kỹ năng</option>
          {skills.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-md">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00284D] border-t-transparent" />
          </div>
        ) : questions.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">Không tìm thấy câu hỏi nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-[#00284D]">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">Loại</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">Nội dung</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">Miền năng lực</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">Kỹ năng</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white">Hành động</th>
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
                      {categoryName(q.categoryId)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {skillName(q.skillId)}
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
          </div>
        )}
      </div>

      <PracticeQuestionDialog
        open={questionDialogOpen}
        onOpenChange={setQuestionDialogOpen}
        question={editQuestion}
      />

      {deleteQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">Xóa câu hỏi</h3>
            <p className="mt-2 text-sm text-gray-600">
              Xóa hẳn câu hỏi này khỏi ngân hàng? Nó sẽ bị gỡ khỏi mọi bài luyện tập đang dùng.
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
                onClick={() => deleteQuestionMutation.mutate(deleteQuestion.id)}
                disabled={deleteQuestionMutation.isPending}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleteQuestionMutation.isPending ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-white p-8 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Kỹ năng</h2>
          <button
            type="button"
            onClick={() => {
              setEditSkill(null)
              setSkillDialogOpen(true)
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00284D] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#001a33] cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            Tạo kỹ năng
          </button>
        </div>
        {skills.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có kỹ năng nào. Tạo mới để bắt đầu.</p>
        ) : (
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
            {skills.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {s.name}{' '}
                    <span className="text-gray-500">({categoryName(s.categoryId)})</span>
                  </p>
                  {s.description && <p className="mt-0.5 text-xs text-gray-500">{s.description}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditSkill(s)
                      setSkillDialogOpen(true)
                    }}
                    className="inline-flex items-center justify-center rounded-lg p-2 text-blue-500 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                    aria-label="Sửa kỹ năng"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteSkillId(s.id)}
                    className="inline-flex items-center justify-center rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                    aria-label="Xóa kỹ năng"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SkillFormDialog open={skillDialogOpen} onOpenChange={setSkillDialogOpen} skill={editSkill} />

      {deleteSkillId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">Xóa kỹ năng</h3>
            <p className="mt-2 text-sm text-gray-600">Bạn có chắc muốn xóa kỹ năng này?</p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteSkillId(null)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => deleteSkillMutation.mutate(deleteSkillId)}
                disabled={deleteSkillMutation.isPending}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleteSkillMutation.isPending ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function QuestionBankPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <QuestionBankContent />
    </RoleGuard>
  )
}
