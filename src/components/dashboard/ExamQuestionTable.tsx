'use client';

import { useState } from 'react';
import { Eye, Filter, Search, X } from 'lucide-react';
import type { QuestionTableRow } from '@/types/exam';

interface ExamQuestionTableProps {
  data: QuestionTableRow[];
  onView?: (row: QuestionTableRow) => void;
}

const DEFAULT_FILTERS = ['Điểm số', 'Bậc năng lực'];

export default function ExamQuestionTable({
  data,
  onView,
}: ExamQuestionTableProps) {
  const [filters, setFilters] = useState<string[]>(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');

  const removeFilter = (label: string) => {
    setFilters((prev) => prev.filter((f) => f !== label));
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md">
      {/* Filters + Search */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-[#00284D]"
              >
                {label}
                <button
                  type="button"
                  onClick={() => removeFilter(label)}
                  className="rounded p-0.5 hover:bg-blue-100 cursor-pointer"
                  aria-label={`Xóa lọc ${label}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <Filter className="h-4 w-4" />
              Bộ lọc
            </button>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi, mã câu hỏi, miền năng lực"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-[#00284D]">
              <th className="w-20 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                Id
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                Câu hỏi
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                Miền năng lực
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                Bậc năng lực
              </th>
              <th className="w-24 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                Điểm số
              </th>
              <th className="w-24 px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row) => (
              <tr
                key={row.id}
                className="transition-colors hover:bg-gray-50/80"
              >
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {row.displayId}
                </td>
                <td className="max-w-md px-6 py-4 text-sm text-gray-700">
                  {row.questionText}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${row.competencyDomainColor}`}
                  >
                    {row.competencyDomain}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="inline-flex rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-medium text-white">
                    {row.competencyLevel}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {row.score}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
