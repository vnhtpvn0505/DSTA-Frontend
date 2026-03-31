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
import { levelDistributionMock, recentExamsMock } from '@/data/dashboardMock'
import { userService } from '@/features/user/user.service'
import { useQuery } from '@tanstack/react-query'
import type { RecentExamRow } from '@/types/dashboard'

export default function DashboardPage() {
  const { user } = useAuth()
  const { isAdmin } = useAuthorization()

  if (isAdmin) {
    return <AdminDashboard />
  }

  return <StudentDashboard user={user} />
}

function AdminDashboard() {
  const { data: adminStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: userService.getAdminStats,
  })

  const statCards = adminStats
    ? [
        { title: 'Tổng sinh viên', value: adminStats.totalStudents, subtitle: '' },
        { title: 'Bài thi hoàn thành', value: adminStats.totalExams, subtitle: '' },
        {
          title: 'Tỉ lệ đạt',
          value: `${adminStats.passRate.toFixed(1)}%`,
          subtitle: `Điểm TB: ${adminStats.avgScore.toFixed(1)}`,
        },
      ]
    : []

  const passedCount = adminStats ? Math.round((adminStats.passRate / 100) * adminStats.totalExams) : 0
  const failedCount = adminStats ? adminStats.totalExams - passedCount : 0
  const resultDistribution = [
    { name: 'Đạt', value: passedCount, percent: adminStats?.passRate ?? 0, color: '#22c55e' },
    { name: 'Chưa đạt', value: failedCount, percent: 100 - (adminStats?.passRate ?? 0), color: '#ef4444' },
  ]

  const handleViewExam = (row: RecentExamRow) => {
    console.log('View exam:', row.id)
  }

  return (
    <div className="p-6">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Bảng thống kê</h1>

      <section className="mb-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card, index) => (
            <StatCard key={index} data={card as any} />
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <ResultDonutChart data={resultDistribution} />
          <LevelBarChart data={levelDistributionMock} />
        </div>
      </section>

      <section>
        <RecentExamsTable data={recentExamsMock} onView={handleViewExam} />
      </section>
    </div>
  )
}

function StudentDashboard({ user }: { user: ReturnType<typeof useAuth>['user'] }) {
  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: userService.getUserStats,
  })

  const { data: competencyDomains = [] } = useQuery({
    queryKey: ['competency-scores'],
    queryFn: userService.getCompetencyScores,
  })

  return (
    <div className="space-y-6 p-6">
      <StudentProfileCard
        name={user?.email?.split('@')[0] ?? ''}
        studentId=""
        faculty=""
      />

      <StudentStatsRow
        highestScore={stats?.highestScore ?? 0}
        maxScore={100}
        currentLevel={stats?.currentRank ?? '-'}
        totalAttempts={stats?.totalAttempts ?? 0}
      />

      {competencyDomains.length > 0 && (
        <StudentRadarChart data={competencyDomains} />
      )}
    </div>
  )
}

