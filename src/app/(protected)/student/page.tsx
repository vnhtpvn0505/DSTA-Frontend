'use client';

import { useState } from 'react';
import StudentStatCard from '@/components/dashboard/StudentStatCard';
import StudentTable from '@/components/dashboard/StudentTable';
import Pagination from '@/components/dashboard/Pagination';
import { studentStatsMock, studentTableMock } from '@/data/studentMock';
import type { StudentTableRow } from '@/types/student';

export default function StudentPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  const handleViewStudent = (row: StudentTableRow) => {
    console.log('View student:', row.id);
  };

  return (
    <div className="p-6">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Quản lý sinh viên
      </h1>

      {/* Statistic Cards */}
      <section className="mb-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {studentStatsMock.map((card, index) => (
            <StudentStatCard key={index} data={card} />
          ))}
        </div>
      </section>

      {/* Filters + Table */}
      <section>
        <StudentTable data={studentTableMock} onView={handleViewStudent} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </section>
    </div>
  );
}
