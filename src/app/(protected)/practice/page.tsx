'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Play, History as HistoryIcon, ListChecks } from 'lucide-react'
import RoleGuard from '@/components/common/RoleGuard'
import { practiceService } from '@/features/practice/practice.service'

type Tab = 'assigned' | 'history'

const STATUS_LABELS: Record<string, string> = {
  in_progress: 'Đang làm',
  completed: 'Đã hoàn thành',
}

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

function PracticeListContent() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('assigned')

  const { data: assigned = [], isLoading: assignedLoading } = useQuery({
    queryKey: ['practice-assigned'],
    queryFn: practiceService.getAssignedExercises,
    enabled: tab === 'assigned',
  })

  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ['practice-history'],
    queryFn: practiceService.getHistory,
    enabled: tab === 'history',
  })

  const startMutation = useMutation({
    mutationFn: (exerciseId: number) => practiceService.startAttempt(exerciseId),
    onSuccess: (attempt) => {
      router.push(`/practice/${attempt.exerciseId}/take`)
    },
  })

  return (
    <main className="min-h-screen bg-[#E8F4FF]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-main sm:text-3xl">Luyện tập</h1>
          <p className="mt-1 text-sm text-gray-500">
            Danh sách bài luyện tập được giao và lịch sử làm bài của bạn.
          </p>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setTab('assigned')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              tab === 'assigned' ? 'bg-main text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ListChecks className="h-4 w-4" />
            Bài luyện tập
          </button>
          <button
            type="button"
            onClick={() => setTab('history')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              tab === 'history' ? 'bg-main text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <HistoryIcon className="h-4 w-4" />
            Lịch sử
          </button>
        </div>

        {tab === 'assigned' && (
          <div className="rounded-2xl bg-white shadow-sm">
            {assignedLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-main border-t-transparent" />
              </div>
            ) : assigned.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-500">
                Bạn chưa được giao bài luyện tập nào.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {assigned.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{ex.title}</p>
                      {ex.description && (
                        <p className="mt-0.5 text-xs text-gray-500">{ex.description}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        {ex.config.questionCount} câu
                        {ex.config.timeLimitMinutes ? ` · ${ex.config.timeLimitMinutes} phút` : ''}
                        {ex.config.retryLimit ? ` · Tối đa ${ex.config.retryLimit} lần` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => startMutation.mutate(ex.id)}
                      disabled={startMutation.isPending}
                      className="inline-flex items-center gap-2 self-start rounded-xl bg-main px-4 py-2 text-sm font-semibold text-white hover:bg-[#002244] disabled:opacity-60 cursor-pointer"
                    >
                      <Play className="h-4 w-4" />
                      Bắt đầu
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {historyLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-main border-t-transparent" />
              </div>
            ) : history.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-500">Chưa có lịch sử làm bài.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#f0f7ff] border-b border-blue-100">
                      <th className="px-4 py-3 text-left font-semibold text-main">Bài luyện tập</th>
                      <th className="px-4 py-3 text-center font-semibold text-main">Lần thứ</th>
                      <th className="px-4 py-3 text-center font-semibold text-main">Điểm</th>
                      <th className="px-4 py-3 text-center font-semibold text-main">Trạng thái</th>
                      <th className="px-4 py-3 text-left font-semibold text-main">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id} className="border-b border-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{h.exerciseTitle}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{h.attemptNumber}</td>
                        <td className="px-4 py-3 text-center text-gray-800">
                          {h.score != null ? `${h.score}%` : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              h.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {STATUS_LABELS[h.status] ?? h.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {h.finishedAt ? formatDate(h.finishedAt) : formatDate(h.startedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default function PracticePage() {
  return (
    <RoleGuard allowedRoles={['student']}>
      <PracticeListContent />
    </RoleGuard>
  )
}
