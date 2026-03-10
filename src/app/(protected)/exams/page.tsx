'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ExamQuestionTable from '@/components/dashboard/ExamQuestionTable';
import ExamStructureTab from '@/components/dashboard/ExamStructureTab';
import Pagination from '@/components/dashboard/Pagination';
import { questionListMock } from '@/data/examMock';
import type { QuestionTableRow } from '@/types/exam';

type ExamTab = 'questions' | 'structure' | 'settings';

const TABS: { id: ExamTab; label: string }[] = [
  { id: 'questions', label: 'Danh sách câu hỏi' },
  { id: 'structure', label: 'Cấu trúc đề thi' },
  { id: 'settings', label: 'Cài đặt' },
];

export default function ExamsPage() {
  const [activeTab, setActiveTab] = useState<ExamTab>('questions');
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;
  const navRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const index = TABS.findIndex((t) => t.id === activeTab);
    const el = tabRefs.current[index];
    const nav = navRef.current;
    if (el && nav) {
      const navRect = nav.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setIndicator({
        left: elRect.left - navRect.left,
        width: elRect.width,
      });
    }
  }, [activeTab]);

  const handleViewQuestion = (row: QuestionTableRow) => {
    console.log('View question:', row.id);
  };

  const handleAddQuestion = () => {
    console.log('Thêm câu hỏi');
  };

  return (
    <div className="p-6">
      {/* Title + Action */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Quản lí bài thi
        </h1>
        <button
          type="button"
          onClick={handleAddQuestion}
          className="inline-flex items-center gap-2 rounded-xl bg-[#00284D] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#001a33] cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Thêm câu hỏi
        </button>
      </div>

      {/* Tabs – sliding underline */}
      <div ref={navRef} className="mb-6 border-b border-gray-200">
        <nav className="relative -mb-px flex gap-8" aria-label="Tabs">
          {TABS.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer border-b-2 border-transparent px-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-[#00284D]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span
            className="absolute bottom-0 left-0 h-0.5 bg-[#00284D] transition-all duration-300 ease-out"
            style={{
              left: indicator.left,
              width: indicator.width,
            }}
            aria-hidden
          />
        </nav>
      </div>

      {/* Content by tab – animation on switch */}
      {activeTab === 'questions' && (
        <div key="questions" className="animate-tab-content-enter">
          <ExamQuestionTable
            data={questionListMock}
            onView={handleViewQuestion}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
      {activeTab === 'structure' && (
        <div key="structure" className="animate-tab-content-enter">
          <ExamStructureTab />
        </div>
      )}
      {activeTab === 'settings' && (
        <div key="settings" className="animate-tab-content-enter">
          <div className="rounded-2xl bg-white p-8 shadow-md">
            <p className="text-gray-600">Nội dung Cài đặt đang phát triển.</p>
          </div>
        </div>
      )}
    </div>
  );
}
