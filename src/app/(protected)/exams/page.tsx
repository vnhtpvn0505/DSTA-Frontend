'use client'

import { useState, useRef, useEffect } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ExamQuestionTable from '@/components/dashboard/ExamQuestionTable'
import ExamStructureTab from '@/components/dashboard/ExamStructureTab'
import Pagination from '@/components/dashboard/Pagination'
import CreateQuestionDialog from '@/components/dashboard/CreateQuestionDialog'
import CreateCategoryDialog from '@/components/dashboard/CreateCategoryDialog'
import EditQuestionDialog from '@/components/dashboard/EditQuestionDialog'
import EditCategoryDialog from '@/components/dashboard/EditCategoryDialog'
import { quizService } from '@/features/quiz/quiz.service'
import type { QuestionTableRow } from '@/types/exam'

type ExamTab = 'questions' | 'structure' | 'settings'

const TABS: { id: ExamTab; label: string }[] = [
  { id: 'questions', label: 'Danh sách câu hỏi' },
  { id: 'structure', label: 'Cấu trúc đề thi' },
  { id: 'settings', label: 'Cài đặt' },
]

const PAGE_SIZE = 10

export default function ExamsPage() {
  const [activeTab, setActiveTab] = useState<ExamTab>('questions')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createCategoryDialogOpen, setCreateCategoryDialogOpen] = useState(false)
  const [editQuestionId, setEditQuestionId] = useState<string | null>(null)
  const [editCategoryTarget, setEditCategoryTarget] = useState<{ id: number; name: string; description?: string } | null>(null)
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null)
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const { data: categoriesData } = useQuery({
    queryKey: ['quiz-categories'],
    queryFn: quizService.getCategories,
    enabled: activeTab === 'questions',
  })
  const categories = categoriesData ?? []

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['quiz-questions', selectedCategoryId, currentPage],
    queryFn: () =>
      quizService.getQuestions({
        ...(selectedCategoryId != null && { categoryId: selectedCategoryId }),
        page: currentPage,
        limit: PAGE_SIZE,
      }),
    enabled: activeTab === 'questions',
  })

  const questionRows = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const navRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const index = TABS.findIndex((t) => t.id === activeTab);
    const el = tabRefs.current[index];
    const nav = navRef.current;
    if (el && nav) {
      const navRect = nav.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setIndicator({
        left: elRect.left - navRect.left,
        width: elRect.width,
      });
    }
  }, [activeTab]);

  const deleteQuestionMutation = useMutation({
    mutationFn: (id: string) => quizService.deleteQuestion(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions'] })
      setDeleteQuestionId(null)
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => quizService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-categories'] })
      setDeleteCategoryId(null)
    },
  })

  const handleViewQuestion = (row: QuestionTableRow) => {
    console.log('View question:', row.id);
  };

  const handleEditQuestion = (row: QuestionTableRow) => setEditQuestionId(row.id)
  const handleDeleteQuestion = (row: QuestionTableRow) => setDeleteQuestionId(row.id)

  const handleAddQuestion = () => setCreateDialogOpen(true)

  const handleCategoryChange = (value: string) => {
    const id = value === '' ? null : Number(value)
    setSelectedCategoryId(id)
    setCurrentPage(1)
  }

  return (
    <div className="p-6">
      {/* Title + Action */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Quản lí bài thi
        </h1>
        <button
          type="button"
          onClick={handleAddQuestion}
          className="inline-flex items-center gap-2 rounded-xl bg-[#00284D] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#001a33] cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Thêm câu hỏi
        </button>
      </div>

      <CreateQuestionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => refetch()}
      />

      {/* Tabs – sliding underline */}
      <div ref={navRef} className="mb-6 border-b border-gray-200">
        <nav className="relative -mb-px flex gap-8" aria-label="Tabs">
          {TABS.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer border-b-2 border-transparent px-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-[#00284D]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span
            className="absolute bottom-0 left-0 h-0.5 bg-[#00284D] transition-all duration-300 ease-out"
            style={{
              left: indicator.left,
              width: indicator.width,
            }}
            aria-hidden
          />
        </nav>
      </div>

      {/* Content by tab – animation on switch */}
      {activeTab === 'questions' && (
        <div key="questions" className="animate-tab-content-enter">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <label htmlFor="question-category" className="text-sm font-medium text-gray-700">
              Miền năng lực
            </label>
            <select
              id="question-category"
              value={selectedCategoryId ?? ''}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
            >
              <option value="">Tất cả</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              Không thể tải danh sách câu hỏi. Vui lòng thử lại.
            </div>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center rounded-2xl bg-white py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00284D] border-t-transparent" />
            </div>
          ) : (
            <>
              <ExamQuestionTable
                data={questionRows}
                onView={handleViewQuestion}
                onEdit={handleEditQuestion}
                onDelete={handleDeleteQuestion}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      )}
      {activeTab === 'structure' && (
        <div key="structure" className="animate-tab-content-enter">
          <ExamStructureTab />
        </div>
      )}
      {activeTab === 'settings' && (
        <div key="settings" className="animate-tab-content-enter">
          <div className="rounded-2xl bg-white p-8 shadow-md">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Miền năng lực</h2>
              <button
                type="button"
                onClick={() => setCreateCategoryDialogOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#00284D] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#001a33] cursor-pointer"
              >
                <Plus className="h-5 w-5" />
                Tạo miền năng lực
              </button>
            </div>
            {categories.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có miền năng lực nào. Tạo mới để bắt đầu.</p>
            ) : (
              <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                      {cat.description && (
                        <p className="mt-0.5 text-xs text-gray-500">{cat.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditCategoryTarget(cat)}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-blue-500 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                        aria-label="Chỉnh sửa miền năng lực"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteCategoryId(cat.id)}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                        aria-label="Xóa miền năng lực"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <CreateCategoryDialog
        open={createCategoryDialogOpen}
        onOpenChange={setCreateCategoryDialogOpen}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['quiz-categories'] })}
      />

      <EditQuestionDialog
        open={editQuestionId != null}
        questionId={editQuestionId != null ? Number(editQuestionId) : null}
        onOpenChange={(open) => { if (!open) setEditQuestionId(null) }}
        onSuccess={() => refetch()}
      />

      <EditCategoryDialog
        open={editCategoryTarget != null}
        category={editCategoryTarget}
        onOpenChange={(open) => { if (!open) setEditCategoryTarget(null) }}
      />

      {/* Delete question confirmation */}
      {deleteQuestionId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">Xóa câu hỏi</h3>
            <p className="mt-2 text-sm text-gray-600">Bạn có chắc muốn xóa câu hỏi này? Hành động này không thể hoàn tác.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteQuestionId(null)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >Hủy</button>
              <button
                type="button"
                onClick={() => deleteQuestionMutation.mutate(deleteQuestionId)}
                disabled={deleteQuestionMutation.isPending}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >{deleteQuestionMutation.isPending ? 'Đang xóa...' : 'Xóa'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete category confirmation */}
      {deleteCategoryId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">Xóa miền năng lực</h3>
            <p className="mt-2 text-sm text-gray-600">Bạn có chắc muốn xóa miền này? Không thể xóa nếu còn câu hỏi thuộc miền đó.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteCategoryId(null)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >Hủy</button>
              <button
                type="button"
                onClick={() => deleteCategoryMutation.mutate(deleteCategoryId)}
                disabled={deleteCategoryMutation.isPending}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >{deleteCategoryMutation.isPending ? 'Đang xóa...' : 'Xóa'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
