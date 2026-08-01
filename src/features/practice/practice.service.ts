import axiosInstance from '@/lib/axios'
import type {
  PracticeExercise,
  PracticeQuestion,
  PracticeAssignment,
  PracticeAttempt,
  PracticeHistoryItem,
  ErrorReportItem,
  SubmitPracticeAttemptResult,
  CreatePracticeExerciseDto,
  UpdatePracticeExerciseDto,
  CreatePracticeQuestionDto,
  UpdatePracticeQuestionDto,
  AssignPracticeDto,
  SubmitPracticeAttemptDto,
} from '@/types/practice'

function unwrap<T>(response: { data: unknown }, key: string): T {
  const data = response.data as Record<string, unknown>
  const inner = data?.data as Record<string, unknown> | undefined
  return (inner?.[key] ?? inner) as T
}

export const practiceService = {
  // ─── Admin: exercises ─────────────────────────────────────────────────────

  /** GET /api/v1/practice/exercises */
  getExercises: async (): Promise<PracticeExercise[]> => {
    const res = await axiosInstance.get('/practice/exercises')
    const list = unwrap<PracticeExercise[]>(res, 'exercises')
    return Array.isArray(list) ? list : []
  },

  /** GET /api/v1/practice/exercises/:id */
  getExerciseById: async (id: number): Promise<PracticeExercise> => {
    const res = await axiosInstance.get(`/practice/exercises/${id}`)
    return unwrap<PracticeExercise>(res, 'exercise')
  },

  /** POST /api/v1/practice/exercises (starts as draft) */
  createExercise: async (dto: CreatePracticeExerciseDto): Promise<PracticeExercise> => {
    const res = await axiosInstance.post('/practice/exercises', dto)
    return unwrap<PracticeExercise>(res, 'exercise')
  },

  /** PATCH /api/v1/practice/exercises/:id */
  updateExercise: async (
    id: number,
    dto: UpdatePracticeExerciseDto,
  ): Promise<PracticeExercise> => {
    const res = await axiosInstance.patch(`/practice/exercises/${id}`, dto)
    return unwrap<PracticeExercise>(res, 'exercise')
  },

  /** DELETE /api/v1/practice/exercises/:id (soft delete; blocked if published) */
  deleteExercise: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/practice/exercises/${id}`)
  },

  /** POST /api/v1/practice/exercises/:id/duplicate */
  duplicateExercise: async (id: number): Promise<PracticeExercise> => {
    const res = await axiosInstance.post(`/practice/exercises/${id}/duplicate`)
    return unwrap<PracticeExercise>(res, 'exercise')
  },

  /** PATCH /api/v1/practice/exercises/:id/publish */
  publishExercise: async (id: number): Promise<PracticeExercise> => {
    const res = await axiosInstance.patch(`/practice/exercises/${id}/publish`)
    return unwrap<PracticeExercise>(res, 'exercise')
  },

  /** PATCH /api/v1/practice/exercises/:id/save-draft */
  saveDraftExercise: async (id: number): Promise<PracticeExercise> => {
    const res = await axiosInstance.patch(`/practice/exercises/${id}/save-draft`)
    return unwrap<PracticeExercise>(res, 'exercise')
  },

  /** PATCH /api/v1/practice/exercises/:id/deactivate */
  deactivateExercise: async (id: number): Promise<PracticeExercise> => {
    const res = await axiosInstance.patch(`/practice/exercises/${id}/deactivate`)
    return unwrap<PracticeExercise>(res, 'exercise')
  },

  // ─── Admin: questions ───────────────────────────────────────────────────

  /** GET /api/v1/practice/exercises/:id/questions (includes isCorrect) */
  getQuestions: async (exerciseId: number): Promise<PracticeQuestion[]> => {
    const res = await axiosInstance.get(`/practice/exercises/${exerciseId}/questions`)
    const list = unwrap<PracticeQuestion[]>(res, 'questions')
    return Array.isArray(list) ? list : []
  },

  /** POST /api/v1/practice/exercises/:id/questions */
  createQuestion: async (
    exerciseId: number,
    dto: CreatePracticeQuestionDto,
  ): Promise<PracticeQuestion> => {
    const res = await axiosInstance.post(`/practice/exercises/${exerciseId}/questions`, dto)
    return unwrap<PracticeQuestion>(res, 'question')
  },

  /** PATCH /api/v1/practice/exercises/:id/questions/:questionId */
  updateQuestion: async (
    exerciseId: number,
    questionId: number,
    dto: UpdatePracticeQuestionDto,
  ): Promise<PracticeQuestion> => {
    const res = await axiosInstance.patch(
      `/practice/exercises/${exerciseId}/questions/${questionId}`,
      dto,
    )
    return unwrap<PracticeQuestion>(res, 'question')
  },

  /** DELETE /api/v1/practice/exercises/:id/questions/:questionId (soft delete) */
  deleteQuestion: async (exerciseId: number, questionId: number): Promise<void> => {
    await axiosInstance.delete(`/practice/exercises/${exerciseId}/questions/${questionId}`)
  },

  // ─── Admin: assignment & reporting ──────────────────────────────────────

  /** POST /api/v1/practice/exercises/:id/assign */
  assignExercise: async (
    exerciseId: number,
    dto: AssignPracticeDto,
  ): Promise<PracticeAssignment[]> => {
    const res = await axiosInstance.post(`/practice/exercises/${exerciseId}/assign`, dto)
    const list = unwrap<PracticeAssignment[]>(res, 'assignments')
    return Array.isArray(list) ? list : []
  },

  /** GET /api/v1/practice/exercises/:id/error-report */
  getErrorReport: async (exerciseId: number): Promise<ErrorReportItem[]> => {
    const res = await axiosInstance.get(`/practice/exercises/${exerciseId}/error-report`)
    const list = unwrap<ErrorReportItem[]>(res, 'report')
    return Array.isArray(list) ? list : []
  },

  // ─── Student: assigned exercises & attempts ─────────────────────────────

  /** GET /api/v1/practice/assigned */
  getAssignedExercises: async (): Promise<PracticeExercise[]> => {
    const res = await axiosInstance.get('/practice/assigned')
    const list = unwrap<PracticeExercise[]>(res, 'exercises')
    return Array.isArray(list) ? list : []
  },

  /** POST /api/v1/practice/exercises/:id/start (creates or resumes an attempt) */
  startAttempt: async (exerciseId: number): Promise<PracticeAttempt> => {
    const res = await axiosInstance.post(`/practice/exercises/${exerciseId}/start`)
    return unwrap<PracticeAttempt>(res, 'attempt')
  },

  /** PATCH /api/v1/practice/attempts/:id/progress */
  saveProgress: async (attemptId: number, answerIds: Record<number, number>): Promise<void> => {
    await axiosInstance.patch(`/practice/attempts/${attemptId}/progress`, { answerIds })
  },

  /** POST /api/v1/practice/attempts/:id/submit */
  submitAttempt: async (
    attemptId: number,
    dto: SubmitPracticeAttemptDto = {},
  ): Promise<SubmitPracticeAttemptResult> => {
    const res = await axiosInstance.post(`/practice/attempts/${attemptId}/submit`, dto)
    return unwrap<SubmitPracticeAttemptResult>(res, 'result')
  },

  /**
   * GET /api/v1/practice/history
   * NOTE: unlike every other endpoint here, the backend puts the array directly
   * in `data` (no wrapping key) — do NOT reuse `unwrap()` for this one.
   */
  getHistory: async (): Promise<PracticeHistoryItem[]> => {
    const res = await axiosInstance.get('/practice/history')
    const data = res.data as Record<string, unknown>
    const list = data?.data
    return Array.isArray(list) ? (list as PracticeHistoryItem[]) : []
  },
}
