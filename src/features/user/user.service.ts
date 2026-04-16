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

export interface RecentExamItem {
  id: number
  studentName: string
  studentEmail: string
  studentId: string
  completedAt: string
  score: number
  rankName: string
  rankLevel: number
  isPassed: boolean
}

export interface LevelDistributionItem {
  level: string
  count: number
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

  getRecentExams: async (limit = 10): Promise<RecentExamItem[]> => {
    const res = await axiosInstance.get<unknown>(`/user/recent-exams?limit=${limit}`)
    const items = unwrap<RecentExamItem[]>(res.data)
    return Array.isArray(items) ? items : []
  },

  getLevelDistribution: async (): Promise<LevelDistributionItem[]> => {
    const res = await axiosInstance.get<unknown>('/user/level-distribution')
    const items = unwrap<LevelDistributionItem[]>(res.data)
    return Array.isArray(items) ? items : []
  },

  // ── Teacher CRUD ────────────────────────────────────────────────────────────

  getTeachers: async (
    page = 1,
    limit = 20,
  ): Promise<{ items: TeacherItem[]; pagination: PaginationMeta }> => {
    const res = await axiosInstance.get<unknown>(`/user/teachers?page=${page}&limit=${limit}`)
    const data = unwrap<{ items: TeacherItem[]; pagination: PaginationMeta }>(res.data)
    return { items: data?.items ?? [], pagination: data?.pagination ?? { total: 0, page, limit, totalPages: 1 } }
  },

  createTeacher: async (payload: CreateTeacherPayload): Promise<TeacherItem> => {
    const res = await axiosInstance.post<unknown>('/user/teachers', payload)
    return unwrap<TeacherItem>(res.data)
  },

  updateTeacher: async (id: number, payload: UpdateTeacherPayload): Promise<TeacherItem> => {
    const res = await axiosInstance.patch<unknown>(`/user/teachers/${id}`, payload)
    return unwrap<TeacherItem>(res.data)
  },

  deleteTeacher: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/user/teachers/${id}`)
  },
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TeacherItem {
  id: number
  username: string
  firstName: string
  email: string
  phoneNumber: string | null
  facultyName: string | null
  createdAt: string
}

export interface CreateTeacherPayload {
  username: string
  firstName: string
  email: string
  password: string
  phoneNumber?: string
  facultyName?: string
}

export interface UpdateTeacherPayload {
  firstName?: string
  phoneNumber?: string
  facultyName?: string
}

// ── ClassItem ─────────────────────────────────────────────────────────────────

export interface ClassItem {
  id: number
  name: string
  code: string
  academicYear: string | null
  isActive: boolean
  createdAt: string
}

export interface CreateClassPayload {
  name: string
  code: string
  academicYear?: string
}

export interface UpdateClassPayload {
  name?: string
  code?: string
  academicYear?: string
  isActive?: boolean
}

// ── CohortItem ────────────────────────────────────────────────────────────────

export interface CohortItem {
  id: number
  name: string
  year: string | null
  description: string | null
  createdAt: string
}

export interface CreateCohortPayload {
  name: string
  year?: string
  description?: string
}

export interface UpdateCohortPayload {
  name?: string
  year?: string
  description?: string
}

// ── ExamPeriodItem ────────────────────────────────────────────────────────────

export type ExamPeriodStatus = 'scheduled' | 'active' | 'ended'

export interface ExamPeriodItem {
  id: number
  name: string
  startDate: string
  endDate: string
  examConfigId: number | null
  allowedClassIds: number[] | null
  status: ExamPeriodStatus
  createdAt: string
}

export interface CreateExamPeriodPayload {
  name: string
  startDate: string
  endDate: string
  examConfigId?: number
  allowedClassIds?: number[]
}

export interface UpdateExamPeriodPayload {
  name?: string
  startDate?: string
  endDate?: string
  examConfigId?: number
  allowedClassIds?: number[]
  status?: ExamPeriodStatus
}
