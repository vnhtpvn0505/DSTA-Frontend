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
  Skill,
  CreateSkillDto,
  UpdateSkillDto,
  QuestionBankFilters,
  AuditLogItem,
  GeneratePracticeAttemptDto,
  ReportSummary,
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

  /** DELETE /api/v1/practice/exercises/:id/questions/:questionId (detaches from this exercise only) */
  deleteQuestion: async (exerciseId: number, questionId: number): Promise<void> => {
    await axiosInstance.delete(`/practice/exercises/${exerciseId}/questions/${questionId}`)
  },

  /** POST /api/v1/practice/questions (standalone bank question, not attached yet) */
  createBankQuestion: async (dto: CreatePracticeQuestionDto): Promise<PracticeQuestion> => {
    const res = await axiosInstance.post('/practice/questions', dto)
    return unwrap<PracticeQuestion>(res, 'question')
  },

  /** PATCH /api/v1/practice/questions/:id */
  updateBankQuestion: async (
    id: number,
    dto: UpdatePracticeQuestionDto,
  ): Promise<PracticeQuestion> => {
    const res = await axiosInstance.patch(`/practice/questions/${id}`, dto)
    return unwrap<PracticeQuestion>(res, 'question')
  },

  /** DELETE /api/v1/practice/questions/:id (removed from bank entirely) */
  deleteBankQuestion: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/practice/questions/${id}`)
  },

  /** POST /api/v1/practice/exercises/:id/questions/attach */
  attachQuestion: async (
    exerciseId: number,
    questionId: number,
    order?: number,
  ): Promise<void> => {
    await axiosInstance.post(`/practice/exercises/${exerciseId}/questions/attach`, {
      questionId,
      order,
    })
  },

  /** GET /api/v1/practice/questions/bank */
  searchQuestionBank: async (filters: QuestionBankFilters = {}): Promise<PracticeQuestion[]> => {
    const res = await axiosInstance.get('/practice/questions/bank', { params: filters })
    const list = unwrap<PracticeQuestion[]>(res, 'questions')
    return Array.isArray(list) ? list : []
  },

  /** GET /api/v1/audit-logs?entityType=practice_exercise&entityId=:id */
  getAuditLogs: async (exerciseId: number): Promise<AuditLogItem[]> => {
    const res = await axiosInstance.get('/audit-logs', {
      params: { entityType: 'practice_exercise', entityId: exerciseId },
    })
    const list = unwrap<AuditLogItem[]>(res, 'logs')
    return Array.isArray(list) ? list : []
  },

  // ─── Skill (kỹ năng) ────────────────────────────────────────────────────

  /** GET /api/v1/practice/skills */
  getSkills: async (): Promise<Skill[]> => {
    const res = await axiosInstance.get('/practice/skills')
    const list = unwrap<Skill[]>(res, 'skills')
    return Array.isArray(list) ? list : []
  },

  /** POST /api/v1/practice/skills */
  createSkill: async (dto: CreateSkillDto): Promise<Skill> => {
    const res = await axiosInstance.post('/practice/skills', dto)
    return unwrap<Skill>(res, 'skill')
  },

  /** PATCH /api/v1/practice/skills/:id */
  updateSkill: async (id: number, dto: UpdateSkillDto): Promise<Skill> => {
    const res = await axiosInstance.patch(`/practice/skills/${id}`, dto)
    return unwrap<Skill>(res, 'skill')
  },

  /** DELETE /api/v1/practice/skills/:id */
  deleteSkill: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/practice/skills/${id}`)
  },

  // ─── Review workflow: Teacher submits, Reviewer approves/rejects ───────

  /** PATCH /api/v1/practice/exercises/:id/submit-review */
  submitForReview: async (id: number): Promise<PracticeExercise> => {
    const res = await axiosInstance.patch(`/practice/exercises/${id}/submit-review`)
    return unwrap<PracticeExercise>(res, 'exercise')
  },

  /** GET /api/v1/practice/exercises/pending-review */
  getPendingReviewExercises: async (): Promise<PracticeExercise[]> => {
    const res = await axiosInstance.get('/practice/exercises/pending-review')
    const list = unwrap<PracticeExercise[]>(res, 'exercises')
    return Array.isArray(list) ? list : []
  },

  /** PATCH /api/v1/practice/exercises/:id/approve */
  approveExercise: async (id: number): Promise<PracticeExercise> => {
    const res = await axiosInstance.patch(`/practice/exercises/${id}/approve`)
    return unwrap<PracticeExercise>(res, 'exercise')
  },

  /** PATCH /api/v1/practice/exercises/:id/reject */
  rejectExercise: async (id: number, reason: string): Promise<PracticeExercise> => {
    const res = await axiosInstance.patch(`/practice/exercises/${id}/reject`, { reason })
    return unwrap<PracticeExercise>(res, 'exercise')
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
  getErrorReport: async (
    exerciseId: number,
    filters: { categoryId?: number; skillId?: number; difficultyId?: number } = {},
  ): Promise<ErrorReportItem[]> => {
    const res = await axiosInstance.get(`/practice/exercises/${exerciseId}/error-report`, {
      params: filters,
    })
    const list = unwrap<ErrorReportItem[]>(res, 'report')
    return Array.isArray(list) ? list : []
  },

  /** GET /api/v1/practice/exercises/:id/report-summary */
  getReportSummary: async (exerciseId: number): Promise<ReportSummary> => {
    const res = await axiosInstance.get(`/practice/exercises/${exerciseId}/report-summary`)
    return unwrap<ReportSummary>(res, 'summary')
  },

  /** GET /api/v1/practice/exercises/:id/error-report/export — returns raw CSV text */
  exportErrorReportCsv: async (exerciseId: number): Promise<string> => {
    const res = await axiosInstance.get(`/practice/exercises/${exerciseId}/error-report/export`)
    return unwrap<string>(res, 'csv')
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

  /** POST /api/v1/practice/generate (custom attempt from self-picked criteria) */
  generateCustomAttempt: async (dto: GeneratePracticeAttemptDto): Promise<PracticeAttempt> => {
    const res = await axiosInstance.post('/practice/generate', dto)
    return unwrap<PracticeAttempt>(res, 'attempt')
  },

  /** GET /api/v1/practice/attempts/:id */
  getAttemptById: async (attemptId: number): Promise<PracticeAttempt> => {
    const res = await axiosInstance.get(`/practice/attempts/${attemptId}`)
    return unwrap<PracticeAttempt>(res, 'attempt')
  },

  /** GET /api/v1/practice/attempts/:id/result (re-view a completed attempt, no re-grading) */
  getAttemptResult: async (attemptId: number): Promise<SubmitPracticeAttemptResult> => {
    const res = await axiosInstance.get(`/practice/attempts/${attemptId}/result`)
    return unwrap<SubmitPracticeAttemptResult>(res, 'result')
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
