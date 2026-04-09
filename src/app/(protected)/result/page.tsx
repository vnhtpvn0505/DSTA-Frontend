'use client'

import RoleGuard from '@/components/common/RoleGuard'
import { useAuth } from '@/hooks/useAuth'
import ResultDonutChart from '@/components/dashboard/ResultDonutChart'
import { useQuery } from '@tanstack/react-query'
import { examService } from '@/features/exam/exam.service'

function isPendingSa(item: { status?: string }) {
  return item.status === 'PENDING_SA_GRADING'
}

export default function ResultPage() {
  const { user } = useAuth()

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['exam-history'],
    queryFn: examService.getHistory,
  })

  // Only count fully-graded exams in stats; pending-SA exams are shown in the table but excluded from averages/pass-rate
  const gradedExams = history.filter((r) => !isPendingSa(r))
  const totalExams = history.length
  const avgScore =
    gradedExams.length > 0
      ? gradedExams.reduce((sum, r) => sum + (r.totalPoints > 0 ? (r.score / r.totalPoints) * 100 : 0), 0) /
        gradedExams.length
      : 0
  const passedCount = gradedExams.filter((r) => r.isPassed).length
  const passRate = gradedExams.length > 0 ? Math.round((passedCount / gradedExams.length) * 100) : 0
  const pendingCount = history.filter(isPendingSa).length

  const resultDistribution = [
    { name: 'Đạt', value: passedCount, percent: passRate, color: '#22c55e' },
    { name: 'Chưa đạt', value: gradedExams.length - passedCount, percent: 100 - passRate, color: '#ef4444' },
  ]

  return (
    <RoleGuard allowedRoles={['student', 'admin']}>
      <main className="min-h-screen bg-[#E8F4FF]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-main sm:text-3xl">
                Kết quả thi
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Xin chào {user?.email}, đây là tổng quan kết quả các bài thi của bạn.
              </p>
            </div>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Điểm trung bình</p>
              <p className="mt-2 text-3xl font-extrabold text-gray-900">
                {avgScore.toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-gray-500">Trên thang điểm 100 (bài đã chấm xong)</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Số bài thi đã làm</p>
              <p className="mt-2 text-3xl font-extrabold text-gray-900">
                {totalExams}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {pendingCount > 0
                  ? `${pendingCount} bài chờ chấm điểm tự luận`
                  : 'Bao gồm tất cả các bài gần đây'}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Tỉ lệ đạt</p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-600">
                {passRate}%
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Số bài thi có trạng thái &quot;Đạt&quot;
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <ResultDonutChart data={resultDistribution} />
            </div>

            <div className="lg:col-span-3">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Lịch sử bài thi
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Danh sách các bài thi gần đây của bạn
                    </p>
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Xếp loại
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Ngày thi
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Điểm
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {isLoading ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400">
                            Đang tải...
                          </td>
                        </tr>
                      ) : history.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400">
                            Chưa có bài thi nào.
                          </td>
                        </tr>
                      ) : (
                        history.map((result) => {
                          const pending = isPendingSa(result)
                          return (
                            <tr key={result.id} className="hover:bg-gray-50/60">
                              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                                {result.rankName}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                                {new Date(result.finishedAt).toLocaleDateString('vi-VN')}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                                {pending ? (
                                  <span>
                                    <span className="font-medium">
                                      {result.mcScore ?? result.score}
                                    </span>
                                    <span className="ml-1 text-xs text-gray-400">
                                      /{result.totalPoints} (TN)
                                    </span>
                                  </span>
                                ) : (
                                  <span>{result.score}/{result.totalPoints}</span>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3">
                                {pending ? (
                                  <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                    Chờ chấm điểm
                                  </span>
                                ) : result.isPassed ? (
                                  <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                    Đạt
                                  </span>
                                ) : (
                                  <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                                    Chưa đạt
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </RoleGuard>
  )
}

