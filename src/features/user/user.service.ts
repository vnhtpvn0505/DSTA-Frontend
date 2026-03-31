import axiosInstance from '@/lib/axios'
import type { StudentTableRow } from '@/types/student'
import type { CompetencyDomain } from '@/components/dashboard/StudentRadarChart'

// ─── Response shapes from backend ───────────────────────────────────────────

export interface UserStatsResponse {
  totalAttempts: number
  highestScore: number | null
  currentRank: string | null
  isPassed: boolean | null
}

export interface CompetencyScoreItem {
  aspectId: number
  aspectName: string
  score: number
}

export interface AdminStatsResponse {
  totalStudents: number
  totalExams: number
  passRate: number
  avgScore: number
}

export interface StudentListItem {
  id: number
  firstName: string
  email: string
  className: string | null
  latestScore: number | null
  rankName: string | null
  isPassed: boolean | null
}

export interface StudentListResponse {
  items: StudentListItem[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CertificateItem {
  id: number
  rankName: string | null
  score: number
  issuedAt: string
  userExamId: number | null
  testId: number | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function unwrap<T>(response: unknown): T {
  const obj = response as Record<string, unknown>
  return (obj?.data ?? obj) as T
}

// ─── Domain color palette ─────────────────────────────────────────────────────

const DOMAIN_COLORS = ['#003562', '#0EA5E9', '#A855F7', '#F59E0B', '#EF4444', '#1E3A5F', '#22c55e', '#f97316']

// ─── Service ─────────────────────────────────────────────────────────────────

export const userService = {
  getUserStats: async (): Promise<UserStatsResponse> => {
    const res = await axiosInstance.get<unknown>('/user/stats')
    return unwrap<UserStatsResponse>(res.data)
  },

  getCompetencyScores: async (): Promise<CompetencyDomain[]> => {
    const res = await axiosInstance.get<unknown>('/user/competency-scores')
    const items = unwrap<CompetencyScoreItem[]>(res.data)
    if (!Array.isArray(items) || items.length === 0) return []
    const maxScore = Math.max(...items.map((i) => i.score), 10)
    return items.map((item, idx) => ({
      domain: item.aspectName,
      shortLabel: `Miền ${idx + 1}`,
      score: item.score,
      maxScore,
      color: DOMAIN_COLORS[idx % DOMAIN_COLORS.length],
    }))
  },

  getAdminStats: async (): Promise<AdminStatsResponse> => {
    const res = await axiosInstance.get<unknown>('/user/admin-stats')
    return unwrap<AdminStatsResponse>(res.data)
  },

  getStudents: async (page = 1, limit = 20): Promise<{ rows: StudentTableRow[]; totalPages: number; total: number }> => {
    const res = await axiosInstance.get<unknown>(`/user/students?page=${page}&limit=${limit}`)
    const data = unwrap<StudentListResponse>(res.data)
    const rows: StudentTableRow[] = (data?.items ?? []).map((item) => ({
      id: String(item.id),
      studentName: item.firstName,
      studentEmail: item.email,
      mssv: item.className ?? '-',
      submittedAt: '-',
      submittedDate: '-',
      score: item.latestScore != null ? String(item.latestScore) : '-',
      levelLabel: item.rankName ?? '-',
      result: item.isPassed === true ? 'PASS' : item.isPassed === false ? 'FAIL' : 'PENDING',
    }))
    return {
      rows,
      totalPages: data?.pagination?.totalPages ?? 1,
      total: data?.pagination?.total ?? 0,
    }
  },

  getCertificates: async (): Promise<CertificateItem[]> => {
    const res = await axiosInstance.get<unknown>('/user/certificates')
    const items = unwrap<CertificateItem[]>(res.data)
    return Array.isArray(items) ? items : []
  },
}
