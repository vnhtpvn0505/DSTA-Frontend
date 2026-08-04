'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Play, Sparkles } from 'lucide-react'
import RoleGuard from '@/components/common/RoleGuard'
import { Button } from '@/components/ui/button'
import { practiceService } from '@/features/practice/practice.service'
import { quizService } from '@/features/quiz/quiz.service'
import type { PracticeQuestionType } from '@/types/practice'

function CustomPracticeContent() {
  const router = useRouter()
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [skillId, setSkillId] = useState<number | ''>('')
  const [questionTypes, setQuestionTypes] = useState<PracticeQuestionType[]>(['mc'])
  const [quantity, setQuantity] = useState(10)
  const [passingScore, setPassingScore] = useState(60)

  const { data: categories = [] } = useQuery({
    queryKey: ['quiz-categories'],
    queryFn: quizService.getCategories,
  })
  const { data: skills = [] } = useQuery({
    queryKey: ['practice-skills'],
    queryFn: practiceService.getSkills,
  })

  const generateMutation = useMutation({
    mutationFn: () =>
      practiceService.generateCustomAttempt({
        categoryId: categoryId === '' ? undefined : categoryId,
        skillId: skillId === '' ? undefined : skillId,
        questionTypes,
        quantity,
        passingScore,
      }),
    onSuccess: (attempt) => {
      router.push(`/practice/attempt/${attempt.id}/take`)
    },
  })

  const toggleType = (type: PracticeQuestionType) => {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )
  }

  return (
    <main className="min-h-screen bg-[#E8F4FF]">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-main" />
          <div>
            <h1 className="text-2xl font-bold text-main">Tự chọn bài luyện tập</h1>
            <p className="mt-1 text-sm text-gray-500">
              Chọn tiêu chí, hệ thống sẽ tạo ngay một phiên luyện tập ngẫu nhiên từ ngân hàng câu hỏi.
            </p>
          </div>
        </div>

        <div className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          {generateMutation.isError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              Không đủ câu hỏi phù hợp với tiêu chí đã chọn. Hãy thử nới lỏng bộ lọc hoặc giảm số
              lượng câu.
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Miền năng lực</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-main focus:outline-none focus:ring-1 focus:ring-main"
            >
              <option value="">Tất cả</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Kỹ năng</label>
            <select
              value={skillId}
              onChange={(e) => setSkillId(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-main focus:outline-none focus:ring-1 focus:ring-main"
            >
              <option value="">Tất cả</option>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Loại câu hỏi</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={questionTypes.includes('mc')}
                  onChange={() => toggleType('mc')}
                />
                Trắc nghiệm
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={questionTypes.includes('sa')}
                  onChange={() => toggleType('sa')}
                />
                Tự luận
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Số lượng câu</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-main focus:outline-none focus:ring-1 focus:ring-main"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Điểm đạt (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-main focus:outline-none focus:ring-1 focus:ring-main"
              />
            </div>
          </div>

          <Button
            className="w-full gap-2 bg-main hover:bg-[#002244]"
            disabled={questionTypes.length === 0 || generateMutation.isPending}
            onClick={() => generateMutation.mutate()}
          >
            <Play className="h-4 w-4" />
            {generateMutation.isPending ? 'Đang tạo phiên luyện tập...' : 'Bắt đầu luyện tập'}
          </Button>
        </div>
      </div>
    </main>
  )
}

export default function CustomPracticePage() {
  return (
    <RoleGuard allowedRoles={['student']}>
      <CustomPracticeContent />
    </RoleGuard>
  )
}
