'use client';

import RoleGuard from '@/components/common/RoleGuard';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={['admin']}>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Báo Cáo</h1>
          <p className="mt-2 text-sm text-gray-600">
            Dành cho Admin - Vai trò hiện tại: {user?.role}
          </p>
        </div>

          <div className="space-y-6">
            {/* Summary Report */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Báo cáo tổng quan
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-md border border-gray-200 p-4">
                  <p className="text-sm text-gray-600">Điểm trung bình</p>
                  <p className="mt-2 text-2xl font-bold text-blue-600">82.5</p>
                </div>
                <div className="rounded-md border border-gray-200 p-4">
                  <p className="text-sm text-gray-600">Tỷ lệ đạt</p>
                  <p className="mt-2 text-2xl font-bold text-green-600">95%</p>
                </div>
                <div className="rounded-md border border-gray-200 p-4">
                  <p className="text-sm text-gray-600">Số bài đã chấm</p>
                  <p className="mt-2 text-2xl font-bold text-purple-600">487</p>
                </div>
              </div>
            </div>

            {/* Detailed Reports */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Báo cáo chi tiết theo lớp
              </h2>
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Lớp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Số học sinh
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Điểm TB
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Tỷ lệ đạt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {[
                      { class: '10A1', students: 35, avg: 85.2, pass: 97 },
                      { class: '10A2', students: 33, avg: 78.5, pass: 91 },
                      { class: '10A3', students: 34, avg: 82.1, pass: 94 },
                      { class: '10A4', students: 36, avg: 88.3, pass: 100 },
                    ].map((report, idx) => (
                      <tr key={idx}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {report.class}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {report.students}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {report.avg}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {report.pass}%
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <Button variant="link" size="sm" className="h-auto p-0">
                            Xem chi tiết
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Options */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Xuất báo cáo
              </h2>
            <div className="flex gap-4">
              <Button variant="default" size="default" className="bg-green-600 hover:bg-green-700">
                Xuất Excel
              </Button>
              <Button variant="destructive" size="default">
                Xuất PDF
              </Button>
              <Button variant="default" size="default">
                In báo cáo
              </Button>
            </div>
            </div>
          </div>
      </main>
    </RoleGuard>
  );
}
