'use client'

import RoleGuard from '@/components/common/RoleGuard'
import { useAuth } from '@/hooks/useAuth'
import ResultDonutChart from '@/components/dashboard/ResultDonutChart'
import { resultDistributionMock } from '@/data/dashboardMock'

const mockResults = [
  { name: 'Toán học', date: '2026-01-15', score: 85, status: 'Đạt' },
  { name: 'Vật lý', date: '2026-01-14', score: 92, status: 'Đạt' },
  { name: 'Hóa học', date: '2026-01-13', score: 78, status: 'Đạt' },
  { name: 'Sinh học', date: '2026-01-12', score: 65, status: 'Đạt' },
]

export default function ResultPage() {
  const { user } = useAuth()

  const totalExams = mockResults.length
  const avgScore =
    mockResults.reduce((sum, r) => sum + r.score, 0) / (totalExams || 1)
  const passRate = 95

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
                Xin chào {user?.fullName ?? user?.email}, đây là tổng quan kết
                quả các bài thi của bạn.
              </p>
            </div>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Điểm trung bình</p>
              <p className="mt-2 text-3xl font-extrabold text-gray-900">
                {avgScore.toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-gray-500">Trên thang điểm 100</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Số bài thi đã làm</p>
              <p className="mt-2 text-3xl font-extrabold text-gray-900">
                {totalExams}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Bao gồm tất cả các môn gần đây
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
              <ResultDonutChart data={resultDistributionMock} />
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
                          Bài thi
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
                      {mockResults.map((result, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/60">
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                            {result.name}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                            {result.date}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                            {result.score}/100
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              {result.status}
                            </span>
                          </td>
                        </tr>
                      ))}
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
