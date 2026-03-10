'use client'

import { useAuth } from '@/hooks/useAuth'
import { useAuthorization } from '@/hooks/useAuthorization'
import StatCard from '@/components/dashboard/StatCard'
import ResultDonutChart from '@/components/dashboard/ResultDonutChart'
import LevelBarChart from '@/components/dashboard/LevelBarChart'
import RecentExamsTable from '@/components/dashboard/RecentExamsTable'
import StudentProfileCard from '@/components/dashboard/StudentProfileCard'
import StudentStatsRow from '@/components/dashboard/StudentStatsRow'
import StudentRadarChart from '@/components/dashboard/StudentRadarChart'
import {
  statCardsMock,
  resultDistributionMock,
  levelDistributionMock,
  recentExamsMock,
} from '@/data/dashboardMock'
import {
  studentProfileMock,
  studentStatsMock,
  competencyDomainsMock,
} from '@/data/studentDashboardMock'
import type { RecentExamRow } from '@/types/dashboard'

export default function DashboardPage() {
  const { user } = useAuth()
  const { isAdmin } = useAuthorization()

  if (isAdmin) {
    const handleViewExam = (row: RecentExamRow) => {
      console.log('View exam:', row.id)
    }

    return (
      <div className="p-6">
        <h1 className="mb-8 text-2xl font-bold text-gray-900">
          Bảng thống kê
        </h1>

        <section className="mb-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {statCardsMock.map((card, index) => (
              <StatCard key={index} data={card} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <ResultDonutChart data={resultDistributionMock} />
            <LevelBarChart data={levelDistributionMock} />
          </div>
        </section>

        <section>
          <RecentExamsTable data={recentExamsMock} onView={handleViewExam} />
        </section>
      </div>
    )
  }

  const profile = {
    name: studentProfileMock.name,
    studentId: studentProfileMock.studentId,
    faculty: studentProfileMock.faculty,
  }

  return (
    <div className="space-y-6 p-6">
      <StudentProfileCard
        name={user?.email?.split('@')[0] ?? profile.name}
        studentId={profile.studentId}
        faculty={profile.faculty}
      />

      <StudentStatsRow
        highestScore={studentStatsMock.highestScore}
        maxScore={studentStatsMock.maxScore}
        currentLevel={studentStatsMock.currentLevel}
        totalAttempts={studentStatsMock.totalAttempts}
      />

      <StudentRadarChart data={competencyDomainsMock} />
    </div>
  )
}
