'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const safeTotal = Math.max(1, Number(totalPages) || 1);
  const safeCurrent = Math.min(Math.max(1, Number(currentPage) || 1), safeTotal);

  const showPages = (): (number | 'ellipsis')[] => {
    if (safeTotal <= 7) {
      return Array.from({ length: safeTotal }, (_, i) => i + 1);
    }
    const result: (number | 'ellipsis')[] = [1, 2, 3];
    result.push('ellipsis');
    result.push(safeTotal - 2, safeTotal - 1, safeTotal);
    return result;
  };

  const pages = showPages();

  return (
    <div className="mt-6 flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, safeCurrent - 1))}
        disabled={safeCurrent <= 1}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        aria-label="Trang trước"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={typeof p === 'number' && !Number.isNaN(p) ? p : `page-${i}`}
            type="button"
            onClick={() => onPageChange(p as number)}
            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium cursor-pointer ${
              safeCurrent === p
                ? 'bg-[#00284D] text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(safeTotal, safeCurrent + 1))}
        disabled={safeCurrent >= safeTotal}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        aria-label="Trang sau"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
