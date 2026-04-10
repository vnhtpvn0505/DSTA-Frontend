import axiosInstance, { SKIP_AUTH_REDIRECT } from '@/lib/axios'

export interface SaPendingExamItem {
  id: number
  studentId: number
  studentName: string
  studentEmail: string
  mcScore: number
  saQuestionCount: number
  graderId: number | null
  graderName: string | null
  submittedAt: string
}

export interface SaGradingItem {
  saQuestionId: number
  question: string
  modelAnswer: string
  studentAnswer: string
  currentScore: number | null
}

export interface SaGradingDetail {
  id: number
  studentId: number
  studentName: string
  saItems: SaGradingItem[]
  mcScore: number
  graderComment: string | null
}

export interface GradeSaResult {
  id: number
  totalScore: number
  mcScore: number
  saScore: number
  isPassed: boolean
  rankName: string
}

export interface AdminUser {
  id: number
  name: string
  email: string
}

export interface GradeSaPayload {
  saScores: Record<number, number>
  graderComment?: string
}

export const gradingService = {
  /** GET /api/v1/exam/grading/pending */
  getPendingExams: async (): Promise<SaPendingExamItem[]> => {
    const res = await axiosInstance.get<{ data: SaPendingExamItem[] }>(
      '/exam/grading/pending',
      { [SKIP_AUTH_REDIRECT]: true } as Record<string, unknown>,
    )
    const body = res.data as unknown as { data?: unknown }
    const items = body?.data
    return Array.isArray(items) ? (items as SaPendingExamItem[]) : []
  },

  /** GET /api/v1/exam/grading/admins */
  getAdmins: async (): Promise<AdminUser[]> => {
    const res = await axiosInstance.get<{ data: AdminUser[] }>(
      '/exam/grading/admins',
      { [SKIP_AUTH_REDIRECT]: true } as Record<string, unknown>,
    )
    const body = res.data as unknown as { data?: unknown }
    const items = body?.data
    return Array.isArray(items) ? (items as AdminUser[]) : []
  },

  /** GET /api/v1/exam/grading/:id */
  getDetail: async (id: number): Promise<SaGradingDetail> => {
    const res = await axiosInstance.get<{ data: SaGradingDetail }>(
      `/exam/grading/${id}`,
      { [SKIP_AUTH_REDIRECT]: true } as Record<string, unknown>,
    )
    const body = res.data as unknown as { data: SaGradingDetail }
    return body.data
  },

  /** PATCH /api/v1/exam/grading/:id/assign */
  assignGrader: async (id: number, graderId: number): Promise<void> => {
    await axiosInstance.patch(
      `/exam/grading/${id}/assign`,
      { graderId },
      { [SKIP_AUTH_REDIRECT]: true } as Record<string, unknown>,
    )
  },

  /** POST /api/v1/exam/grading/:id/submit */
  submitGrade: async (id: number, payload: GradeSaPayload): Promise<GradeSaResult> => {
    const res = await axiosInstance.post<{ data: GradeSaResult }>(
      `/exam/grading/${id}/submit`,
      payload,
      { [SKIP_AUTH_REDIRECT]: true } as Record<string, unknown>,
    )
    const body = res.data as unknown as { data: GradeSaResult }
    return body.data
  },
}
