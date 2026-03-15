'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import ExamQuestionTable from '@/components/dashboard/ExamQuestionTable'
import ExamStructureTab from '@/components/dashboard/ExamStructureTab'
import Pagination from '@/components/dashboard/Pagination'
import CreateQuestionDialog from '@/components/dashboard/CreateQuestionDialog'
import CreateCategoryDialog from '@/components/dashboard/CreateCategoryDialog'
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(1)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createCategoryDialogOpen, setCreateCategoryDialogOpen] = useState(false)
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

  const handleViewQuestion = (row: QuestionTableRow) => {
    console.log('View question:', row.id);
  };

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
            <p className="text-gray-600">
              Quản lý các miền năng lực (danh mục) cho ngân hàng câu hỏi.
            </p>
          </div>
        </div>
      )}

      <CreateCategoryDialog
        open={createCategoryDialogOpen}
        onOpenChange={setCreateCategoryDialogOpen}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['quiz-categories'] })}
      />
    </div>
  );
}
