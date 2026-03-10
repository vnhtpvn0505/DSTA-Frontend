'use client';

import RoleGuard from '@/components/common/RoleGuard';
import { useAuth } from '@/hooks/useAuth';

export default function ResultPage() {
  const { user } = useAuth();

  return (
    <RoleGuard allowedRoles={['student', 'admin']}>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Kết Quả Thi</h1>
          <p className="mt-2 text-sm text-gray-600">
            Vai trò hiện tại: {user?.role}
          </p>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Bài thi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ngày thi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Điểm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {[
                { name: 'Toán học', date: '2026-01-15', score: 85, status: 'Đạt' },
                { name: 'Vật lý', date: '2026-01-14', score: 92, status: 'Đạt' },
                { name: 'Hóa học', date: '2026-01-13', score: 78, status: 'Đạt' },
                { name: 'Sinh học', date: '2026-01-12', score: 65, status: 'Đạt' },
              ].map((result, idx) => (
                <tr key={idx}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {result.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {result.date}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {result.score}/100
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                      {result.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </RoleGuard>
  );
}
