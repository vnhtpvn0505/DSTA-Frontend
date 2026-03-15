import axiosInstance, { SKIP_AUTH_REDIRECT } from '@/lib/axios'
import type { ExamSession } from '@/types/exam'

export interface GenerateExamParams {
  categoryId: number
  numberOfQuestions: number
}

function extractExamSession(body: unknown): ExamSession {
  const session = parseExamSession(body)
  if (session) return session
  throw new Error('Phản hồi từ máy chủ không hợp lệ')
}

function parseExamSession(body: unknown): ExamSession | null {
  if (!body || typeof body !== 'object') return null
  const obj = body as Record<string, unknown>
  const data = obj.data as Record<string, unknown> | undefined
  const session =
    (data?.examSession as ExamSession | undefined) ??
    (obj.examSession as ExamSession | undefined) ??
    (Array.isArray(data?.content) && (data?.content as unknown[])[0]
      ? ((data?.content as unknown[])[0] as ExamSession)
      : undefined) ??
    (data && typeof data.id === 'number' && Array.isArray(data.questions)
      ? (data as unknown as ExamSession)
      : undefined)
  if (
    session &&
    typeof session.id === 'number' &&
    Array.isArray(session.questions)
  ) {
    return session
  }
  return null
}

export const examService = {
  /**
   * POST /api/v1/exam/generate
   * Tạo bài thi mới cho user hiện tại
   */
  generate: async (params: GenerateExamParams): Promise<ExamSession> => {
    const response = await axiosInstance.post<unknown>(
      '/exam/generate',
      params,
      { [SKIP_AUTH_REDIRECT]: true } as Record<string, unknown>,
    )
    return extractExamSession(response.data)
  },

  /**
   * GET /api/v1/exam/current
   * Lấy bài thi đang làm dở (in progress) của user. Trả null nếu không có.
   */
  getCurrentSession: async (): Promise<ExamSession | null> => {
    try {
      const response = await axiosInstance.get<unknown>('/exam/current', {
        [SKIP_AUTH_REDIRECT]: true,
      } as Record<string, unknown>)
      return parseExamSession(response.data)
    } catch {
      return null
    }
  },

  /**
   * GET /api/v1/exam/sessions/:id
   * Lấy chi tiết phiên thi theo id (để khôi phục khi sinh viên bị out giữa chừng).
   */
  getSessionById: async (id: number): Promise<ExamSession | null> => {
    try {
      const response = await axiosInstance.get<unknown>(
        `/exam/sessions/${id}`,
        {
          [SKIP_AUTH_REDIRECT]: true,
        } as Record<string, unknown>,
      )
      return parseExamSession(response.data)
    } catch {
      return null
    }
  },

  /**
   * POST /api/v1/exam/{id}/submit
   * Nộp bài thi và nhận kết quả. Body rỗng hoặc answerIds: [] = nộp với 0 điểm (Hủy và làm bài mới).
   */
  submitExam: async (
    examId: number,
    body?: { answerIds?: number[] },
  ): Promise<SubmitExamResult> => {
    const response = await axiosInstance.post<unknown>(
      `/exam/${examId}/submit`,
      body ?? { answerIds: [] },
      { [SKIP_AUTH_REDIRECT]: true } as Record<string, unknown>,
    )
    return parseSubmitResult(response.data)
  },
}

export interface SubmitExamResult {
  score?: number
  totalScore?: number
  passed?: boolean
  message?: string
}

function parseSubmitResult(body: unknown): SubmitExamResult {
  if (!body || typeof body !== 'object') return { score: 0 }
  const obj = body as Record<string, unknown>
  const data = (obj.data as Record<string, unknown>) ?? obj
  const score = Number(data?.score ?? data?.totalScore ?? 0)
  return {
    score: Number.isFinite(score) ? score : 0,
    totalScore: Number(data?.totalScore) || undefined,
    passed: Boolean(data?.passed),
    message: String(data?.message ?? obj?.message ?? ''),
  }
}
