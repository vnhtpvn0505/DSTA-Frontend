'use client';

import { useState } from 'react';
import StudentStatCard from '@/components/dashboard/StudentStatCard';
import StudentTable from '@/components/dashboard/StudentTable';
import Pagination from '@/components/dashboard/Pagination';
import { userService } from '@/features/user/user.service';
import { useQuery } from '@tanstack/react-query';
import type { StudentTableRow } from '@/types/student';

export default function StudentPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: adminStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: userService.getAdminStats,
  });

  const { data: studentsData } = useQuery({
    queryKey: ['students', currentPage],
    queryFn: () => userService.getStudents(currentPage, 20),
  });

  const rows: StudentTableRow[] = studentsData?.rows ?? [];
  const totalPages = studentsData?.totalPages ?? 1;
  const total = studentsData?.total ?? 0;
  const passedCount = adminStats ? Math.round((adminStats.passRate / 100) * total) : 0;

  const statCards = [
    {
      title: 'Tổng sinh viên',
      value: adminStats?.totalStudents ?? 0,
      trendPercent: 0,
      trendUp: true,
      icon: 'users' as const,
    },
    {
      title: 'Tổng sinh viên hoàn thành',
      value: passedCount,
      trendPercent: 0,
      trendUp: true,
      icon: 'completed' as const,
    },
    {
      title: 'Tổng sinh viên không hoàn thành',
      value: total - passedCount,
      trendPercent: 0,
      trendUp: false,
      icon: 'incomplete' as const,
    },
  ];

  const handleViewStudent = (row: StudentTableRow) => {
    console.log('View student:', row.id);
  };

  return (
    <div className="p-6">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Quản lý sinh viên
      </h1>

      <section className="mb-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card, index) => (
            <StudentStatCard key={index} data={card} />
          ))}
        </div>
      </section>

      <section>
        <StudentTable data={rows} onView={handleViewStudent} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </section>
    </div>
  );
}
