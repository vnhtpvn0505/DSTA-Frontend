'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';

const STRUCTURE_CONFIG = {
  totalQuestions: 60,
  durationMinutes: 60,
  averageScore: 500,
  scoreScaleNote: 'Thang điểm từ 1000',
};

const SKILL_AREAS = [
  'KHAI THÁC DỮ LIỆU VÀ THÔNG TIN',
  'GIAO TIẾP VÀ HỢP TÁC TRONG MÔI TRƯỜNG SỐ',
  'SÁNG TẠO NỘI DUNG SỐ',
  'GIẢI QUYẾT VẤN ĐỀ VÀ PHÁT TRIỂN KỸ NĂNG SỐ',
  'ỨNG DỤNG TRÍ TUỆ NHÂN TẠO (AI)',
];

const DEFAULT_BASIC = 6;
const DEFAULT_TOTAL_PER_ROW = 15;
const SUMMARY_BASIC = 36;
const SUMMARY_PERCENT = 20;
const SUMMARY_GRAND_TOTAL = 100;

export default function ExamStructureTab() {
  const [isEditing, setIsEditing] = useState(false);
  const [distribution, setDistribution] = useState<Record<string, [string, string, string]>>(
    () =>
      Object.fromEntries(
        SKILL_AREAS.map((area) => [area, ['06', '06', '06']])
      )
  );

  const handleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const handleBasicChange = (area: string, colIndex: number, value: string) => {
    if (!isEditing) return;
    setDistribution((prev: any) => {
      const row = prev[area] ?? ['06', '06', '06'];
      const next = [...row];
      next[colIndex] = value.replace(/\D/g, '').slice(0, 2) || '0';
      return { ...prev, [area]: next };
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Cấu hình chung */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <h2 className="mb-6 text-lg font-bold text-gray-900">
          Cấu hình chung
        </h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">
              Tổng số câu hỏi
            </label>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base font-medium text-gray-900">
              {STRUCTURE_CONFIG.totalQuestions}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">
              Thời gian làm bài
            </label>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base font-medium text-gray-900">
              {STRUCTURE_CONFIG.durationMinutes}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">
              Điểm trung bình
            </label>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base font-medium text-gray-900">
              {STRUCTURE_CONFIG.averageScore}
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              {STRUCTURE_CONFIG.scoreScaleNote}
            </p>
          </div>
        </div>
      </div>

      {/* Phân bổ câu hỏi */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            Phân bổ câu hỏi
          </h2>
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex items-center gap-2 rounded-lg bg-[#00284D] px-3 py-2 text-sm font-medium text-white hover:bg-[#001a33] cursor-pointer"
          >
            <Pencil className="h-4 w-4" />
            Chỉnh sửa
          </button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[400px] text-sm">
            <thead>
              <tr className="bg-[#00284D] text-white">
                <th className="px-4 py-3 text-left font-semibold">
                  Miền năng lực
                </th>
                <th className="px-4 py-3 text-center font-semibold">
                  Cơ bản
                </th>
                <th className="px-4 py-3 text-center font-semibold">
                  Cơ bản
                </th>
                <th className="px-4 py-3 text-center font-semibold">
                  Cơ bản
                </th>
                <th className="px-4 py-3 text-center font-semibold">
                  Tổng
                </th>
              </tr>
            </thead>
            <tbody>
              {SKILL_AREAS.map((area, i) => (
                <tr
                  key={area}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/80'}
                >
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                    {area}
                  </td>
                  {[0, 1, 2].map((colIndex) => (
                    <td key={colIndex} className="px-4 py-2 text-center">
                      {isEditing ? (
                        <input
                          type="text"
                          value={distribution[area]?.[colIndex] ?? '06'}
                          onChange={(e) =>
                            handleBasicChange(area, colIndex, e.target.value)
                          }
                          className="w-14 rounded-lg border border-gray-300 px-2 py-1.5 text-center text-sm focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">
                          {distribution[area]?.[colIndex] ?? '06'}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center font-semibold text-gray-900">
                    {DEFAULT_TOTAL_PER_ROW}
                  </td>
                </tr>
              ))}
              <tr className="bg-[#00284D] text-white">
                <td className="px-4 py-3 font-semibold">Tổng</td>
                <td className="px-4 py-3 text-center">
                  {SUMMARY_BASIC}
                  <span className="ml-1 text-white/90">({SUMMARY_PERCENT}%)</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {SUMMARY_BASIC}
                  <span className="ml-1 text-white/90">({SUMMARY_PERCENT}%)</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {SUMMARY_BASIC}
                  <span className="ml-1 text-white/90">({SUMMARY_PERCENT}%)</span>
                </td>
                <td className="px-4 py-3 text-center font-semibold">
                  {SUMMARY_GRAND_TOTAL}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
