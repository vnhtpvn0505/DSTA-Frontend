/**
 * Types for the Practice module (`/api/v1/practice/*`).
 * Mirrors backend entities/DTOs in DSTA-Backend/src/modules/practice.
 */

export type PracticeExerciseStatus =
  | 'draft'
  | 'pending_review'
  | 'rejected'
  | 'approved'
  | 'published'
  | 'inactive'
export type PracticeQuestionType = 'mc' | 'sa'
export type RevealMode = 'after_submit' | 'after_each_question' | 'never'
export type PracticeAttemptStatus = 'in_progress' | 'completed'

export interface PracticeExerciseConfig {
  questionCount: number
  questionTypes: PracticeQuestionType[]
  shuffleQuestions: boolean
  shuffleOptions: boolean
  timeLimitMinutes: number | null
  retryLimit: number | null
  passingScore: number
  revealMode: RevealMode
}

export interface PracticeExercise {
  id: number
  title: string
  description?: string | null
  status: PracticeExerciseStatus
  lessonId?: number | null
  categoryId?: number | null
  category?: { id: number; name: string } | null
  config: PracticeExerciseConfig
  createdAt?: string
  updatedAt?: string
  questions?: PracticeQuestion[]
  createdBy?: number | null
  submittedForReviewAt?: string | null
  reviewedBy?: number | null
  reviewedAt?: string | null
  rejectionReason?: string | null
}

export interface PracticeOption {
  id: number
  optionText: string
  /** Only present in Admin responses; hidden from students while attempting. */
  isCorrect?: boolean
  questionId?: number
}

export interface PracticeQuestion {
  id: number
  type: PracticeQuestionType
  content: string
  hint?: string | null
  explanationCorrect?: string | null
  explanationIncorrect?: string | null
  commonMistakes?: string | null
  solution?: string | null
  knowledgeToReview?: string | null
  sampleAnswer?: string | null
  categoryId?: number | null
  skillId?: number | null
  difficultyId?: number | null
  createdBy?: number | null
  options?: PracticeOption[]
}

export interface Skill {
  id: number
  name: string
  description?: string | null
  categoryId?: number | null
}

export interface CreateSkillDto {
  name: string
  description?: string
  categoryId?: number
}

export type UpdateSkillDto = Partial<CreateSkillDto>

export interface QuestionBankFilters {
  search?: string
  createdBy?: number
  categoryId?: number
  skillId?: number
  difficultyId?: number
}

export interface PracticeAssignment {
  id: number
  exerciseId: number
  classId?: number | null
  userId?: number | null
  dueDate?: string | null
}

/** Question shape returned to students while attempting (answers hidden). */
export interface SafePracticeQuestion {
  id: number
  content: string
  hint?: string | null
  options: { id: number; optionText: string }[]
}

export interface PracticeAttempt {
  id: number
  exerciseId: number | null
  attemptNumber: number
  questions: SafePracticeQuestion[]
  answerIds: Record<number, number>
  status: PracticeAttemptStatus
  startedAt?: string
}

export interface GeneratePracticeAttemptDto {
  categoryId?: number
  skillId?: number
  difficultyIds?: number[]
  questionTypes?: PracticeQuestionType[]
  quantity: number
  passingScore?: number
}

export interface PracticeAttemptFeedback {
  questionId: number
  isCorrect: boolean
  selectedOptionId: number | null
  explanation?: string | null
  solution?: string | null
}

export interface ReportBreakdownGroup {
  id: number
  total: number
  correct: number
}

export interface SubmitPracticeAttemptResult {
  id: number
  score: number
  passingScore: number
  isPassed: boolean
  feedback: PracticeAttemptFeedback[]
  breakdown: {
    byCategory: ReportBreakdownGroup[]
    bySkill: ReportBreakdownGroup[]
  }
}

export interface ReportSummary {
  byCategory: ReportBreakdownGroup[]
  bySkill: ReportBreakdownGroup[]
}

export interface PracticeHistoryItem {
  id: number
  exerciseId: number | null
  exerciseTitle: string
  attemptNumber: number
  score: number | null
  status: PracticeAttemptStatus
  startedAt: string
  finishedAt: string | null
}

export interface AuditLogItem {
  id: number
  actorId: number | null
  action: string
  entityType: string
  entityId: number
  metadata?: Record<string, unknown> | null
  createdAt: string
}

export interface ErrorReportItem {
  questionId: number
  content: string
  totalAttempts: number
  incorrectAttempts: number
  errorRatePercent: number
}

// ─── Request DTOs ───────────────────────────────────────────────────────────

export interface CreatePracticeExerciseDto {
  title: string
  description?: string
  lessonId?: number
  categoryId?: number
  config: PracticeExerciseConfig
}

export type UpdatePracticeExerciseDto = Partial<CreatePracticeExerciseDto>

export interface CreatePracticeOptionDto {
  optionText: string
  isCorrect: boolean
}

export interface CreatePracticeQuestionDto {
  type: PracticeQuestionType
  content: string
  hint?: string
  explanationCorrect?: string
  explanationIncorrect?: string
  commonMistakes?: string
  solution?: string
  knowledgeToReview?: string
  sampleAnswer?: string
  categoryId?: number
  skillId?: number
  difficultyId?: number
  options?: CreatePracticeOptionDto[]
}

export type UpdatePracticeQuestionDto = Partial<CreatePracticeQuestionDto>

export interface AssignPracticeDto {
  classId?: number
  userIds?: number[]
  dueDate?: string
}

export interface SubmitPracticeAttemptDto {
  answerIds?: Record<number, number>
}
