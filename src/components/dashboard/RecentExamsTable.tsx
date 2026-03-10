'use client';

import { Eye } from 'lucide-react';
import type { RecentExamRow, ExamResultStatus } from '@/types/dashboard';

interface RecentExamsTableProps {
  data: RecentExamRow[];
  onView?: (row: RecentExamRow) => void;
}

const resultConfig: Record<
  ExamResultStatus,
  { label: string; className: string }
> = {
  PASS: { label: 'ĐẠT', className: 'bg-green-100 text-green-800' },
  FAIL: { label: 'KHÔNG ĐẠT', className: 'bg-red-100 text-red-800' },
  PENDING: {
    label: 'CHỜ KẾT QUẢ',
    className: 'bg-amber-100 text-amber-800',
  },
};

export default function RecentExamsTable({
  data,
  onView,
}: RecentExamsTableProps) {
  return (
    <div className="rounded-2xl bg-white shadow-md overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Bài thi gần đây
        </h3>
        <span className='text-main cursor-pointer font-medium text-sm'>
          Xem tất cả
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200 bg-[#00284D]">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                Sinh viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                MSSV
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                Thời gian hoàn thành
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                Điểm số
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                Bậc năng lực
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                Kết quả
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row) => {
              const config = resultConfig[row.result];
              return (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-gray-50/80"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {row.studentName}
                      </p>
                      <p className="text-xs text-gray-500">{row.studentEmail}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {row.studentId}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {row.completedAt}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {row.score}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    Bậc {row.level || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
                    >
                      {config.label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onView?.(row)}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                      aria-label="Xem chi tiết"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
